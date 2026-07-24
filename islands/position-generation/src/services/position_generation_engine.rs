//! Position Generation Engine — Orchestrates the full position generation pipeline

use crate::services::{BusinessNeedDiscovery, PositionGraphBuilder, RepresentativeCalibrator};
use genflow_receptors::{
    AxisWeights, BusinessAnalysisRequest, GeneratedPositionProfile, JobPosition,
    PositionGenerationEvidence, PositionGenerationMethod, PositionStatus, Score,
};
use genflow_shared_infra::error::AppError;
use sqlx::PgPool;
use uuid::Uuid;

pub struct PositionGenerationEngine {
    #[allow(dead_code)]
    pool: PgPool,
    need_discovery: BusinessNeedDiscovery,
    graph_builder: PositionGraphBuilder,
    calibrator: RepresentativeCalibrator,
}

impl PositionGenerationEngine {
    pub fn new(pool: PgPool) -> Self {
        Self {
            pool,
            need_discovery: BusinessNeedDiscovery::new(),
            graph_builder: PositionGraphBuilder::new(),
            calibrator: RepresentativeCalibrator::new(),
        }
    }

    /// Generate a position from an analysis request
    pub async fn generate(
        &self,
        request: &BusinessAnalysisRequest,
    ) -> Result<GeneratedPositionProfile, AppError> {
        // 1. Discover business needs
        let needs = self.need_discovery.discover(request);

        // 2. Determine axis weights
        let weights = request
            .representative_context
            .as_ref()
            .map(|ctx| {
                // Adjust default weights based on representative context
                let mut w = AxisWeights::default();
                if ctx.use_personality {
                    w.work_style += ctx.requested_weight * 0.10;
                    w.capability -= ctx.requested_weight * 0.05;
                }
                w
            })
            .unwrap_or_default();

        // 3. Build position graph
        let position_id = Uuid::new_v4();
        let mut graph = self.graph_builder.build(position_id, &weights);

        // 4. Apply representative calibration (if provided)
        if let Some(ctx) = &request.representative_context {
            // Default to Manager relation for now — real implementation would load from DB
            self.calibrator
                .calibrate(
                    &mut graph,
                    genflow_receptors::RepresentativeRelation::Manager,
                    ctx.requested_weight,
                    ctx.use_personality,
                )
                .ok(); // silent fail for calibration — non-critical
        }

        // 5. Create position record
        let position = JobPosition {
            id: position_id,
            organization_id: request.organization_id,
            created_by_rep_id: request.representative_id,
            position_code: format!("POS-{}", &position_id.to_string()[..8]),
            title: self.infer_title(&needs),
            description: None,
            generation_method: match &request.input_mode {
                genflow_receptors::BusinessInputMode::DirectRequest { .. } => {
                    PositionGenerationMethod::DirectRequest
                }
                genflow_receptors::BusinessInputMode::GapAnalysis { .. } => {
                    PositionGenerationMethod::GapDriven
                }
                _ => PositionGenerationMethod::BusinessAnalysis,
            },
            status: PositionStatus::Draft,
        };

        // 6. Build evidence
        let evidence = PositionGenerationEvidence {
            generation_method: position.generation_method.as_db_str().to_string(),
            business_needs_used: needs.iter().map(|n| n.need_id.clone()).collect(),
            mcp_contexts_used: vec![], // populated from MCP resolution
            standards_used: vec![],
            representative_calibration_used: request.representative_context.is_some(),
            representative_effective_weight: request
                .representative_context
                .as_ref()
                .map(|ctx| ctx.requested_weight)
                .unwrap_or(0.0),
            rationale: needs.iter().map(|n| n.description.clone()).collect(),
        };

        // 7. Build requirements from graph dimensions
        let requirements: Vec<genflow_receptors::PositionRequirement> = graph
            .axes
            .iter()
            .flat_map(|axis| {
                axis.dimensions
                    .iter()
                    .map(|dim| genflow_receptors::PositionRequirement {
                        axis_code: axis.code,
                        requirement_type: genflow_receptors::RequirementType::Skill,
                        description: dim.description.clone(),
                        importance: if dim.is_mandatory {
                            genflow_receptors::RequirementImportance::Critical
                        } else {
                            genflow_receptors::RequirementImportance::Important
                        },
                        source: genflow_receptors::RequirementSource::Generated,
                        rationale: format!("Derived from {} axis", axis.code.as_str()),
                        score_range: dim.min.map(|m| {
                            (
                                m,
                                dim.ideal.unwrap_or(Score::default()),
                                dim.max.unwrap_or(Score::max()),
                            )
                        }),
                    })
            })
            .collect();

        tracing::info!(
            position_id = %position_id,
            title = %position.title,
            "Position generated"
        );

        Ok(GeneratedPositionProfile {
            position,
            graph,
            requirements,
            evidence,
            warnings: vec![],
        })
    }

    /// Infer a position title from the discovered needs
    fn infer_title(&self, needs: &[genflow_receptors::BusinessNeed]) -> String {
        if needs.is_empty() {
            return "General Position".to_string();
        }

        let primary = &needs[0]; // highest priority
        match primary.need_type {
            genflow_receptors::BusinessNeedType::CapabilityGap => {
                format!("{} Specialist", primary.description)
            }
            genflow_receptors::BusinessNeedType::ProcessBottleneck => {
                format!("{} Manager", primary.description)
            }
            genflow_receptors::BusinessNeedType::GrowthOpportunity => {
                format!("{} Lead", primary.description)
            }
            genflow_receptors::BusinessNeedType::DirectPositionRequest => {
                primary.description.clone()
            }
            genflow_receptors::BusinessNeedType::RiskMitigation => {
                format!("{} Analyst", primary.description)
            }
        }
    }
}

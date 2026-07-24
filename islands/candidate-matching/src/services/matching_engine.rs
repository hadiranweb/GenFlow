//! 5-Axis Matching Engine — Core matching algorithm

use sqlx::PgPool;
use uuid::Uuid;
use genflow_receptors::{
    JobMatch, AxisMatch, GapSeverity, MatchStatus, Score,
    RiskFlag, FlagSeverity,
    PositionGraph, CandidateProfile, BigFiveScores,
};
use genflow_shared_infra::error::AppError;

pub struct MatchingEngine {
    pool: PgPool,
}

impl MatchingEngine {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    /// Calculate a match between a position and candidate
    pub async fn calculate_match(
        &self,
        position_id: Uuid,
        candidate_id: Uuid,
    ) -> Result<JobMatch, AppError> {
        // Load position data
        let graph = self.load_position_graph(position_id).await?;
        let candidate = self.load_candidate_profile(candidate_id).await?;

        // Calculate 5-axis matches
        let capability = self.match_capability_axis(&graph, &candidate)?;
        let output_kpi = self.match_output_kpi_axis(&graph, &candidate)?;
        let business_gap = self.match_business_gap_axis(&graph, &candidate)?;
        let work_style = self.match_work_style_axis(&graph, &candidate)?;
        let growth = self.match_growth_motivation_axis(&graph, &candidate)?;

        // Calculate composite
        let composite = self.calculate_composite(
            &capability, &output_kpi, &business_gap, &work_style, &growth, &graph
        );

        // Identify risk flags
        let risk_flags = self.identify_risk_flags(&work_style, &candidate);

        // Determine if human review is required
        let human_review = composite.value() < 60.0
            || risk_flags.iter().any(|f| f.severity == FlagSeverity::ActionRequired);

        // Save match
        let match_id = self.save_match(
            position_id, candidate_id,
            &capability, &output_kpi, &business_gap, &work_style, &growth,
            composite,
        ).await?;

        tracing::info!(
            match_id = %match_id,
            composite = %composite,
            human_review = %human_review,
            "Match calculated"
        );

        Ok(JobMatch {
            id: match_id,
            position_id,
            candidate_id,
            capability_match: capability,
            output_kpi_match: output_kpi,
            business_gap_match: business_gap,
            work_style_alignment: work_style,
            growth_motivation_match: growth,
            composite_index: composite,
            confidence_score: Score::new(85.0).unwrap_or_default(),
            status: MatchStatus::PendingReview,
            human_review_required: human_review,
            calculated_at: chrono::Utc::now(),
        })
    }

    // ─── Axis Matching Functions ───

    fn match_capability_axis(&self, graph: &PositionGraph, candidate: &CandidateProfile) -> Result<AxisMatch, AppError> {
        let axis = graph.axes.iter()
            .find(|a| a.code == genflow_receptors::AxisCode::Capability)
            .ok_or(AppError::Business("Missing capability axis"))?;

        let mut details = Vec::new();
        let mut total_percentage = 0.0;
        let count = axis.dimensions.len().max(1);

        for dim in &axis.dimensions {
            let candidate_score = candidate.get_skill_score(&dim.code)
                .or(candidate.get_skill_score(&dim.description))
                .unwrap_or(50.0);

            let cs = Score::new(candidate_score).unwrap_or_default();
            let min = dim.min.unwrap_or(Score::new(0.0).unwrap());
            let ideal = dim.ideal.unwrap_or(Score::new(70.0).unwrap());
            let max = dim.max.unwrap_or(Score::new(100.0).unwrap());

            let match_pct = if cs.value() >= ideal.value() {
                100.0 - (cs.value() - ideal.value()) * 0.5
            } else if cs.value() >= min.value() {
                (cs.value() - min.value()) / (ideal.value() - min.value()) * 100.0
            } else {
                0.0
            };

            details.push(genflow_receptors::DimensionMatchDetail {
                dimension_code: dim.code.clone(),
                required_range: (min, max),
                candidate_score: cs,
                match_percentage: Score::new_unchecked(match_pct),
            });

            total_percentage += match_pct;
        }

        let avg = total_percentage / count as f32;
        let severity = if avg >= 80.0 { GapSeverity::Aligned }
            else if avg >= 60.0 { GapSeverity::Acceptable }
            else if avg >= 40.0 { GapSeverity::Development }
            else { GapSeverity::Misaligned };

        Ok(AxisMatch {
            axis_code: "capability".to_string(),
            match_percentage: Score::new_unchecked(avg),
            gap_severity: severity,
            details,
        })
    }

    fn match_output_kpi_axis(&self, _graph: &PositionGraph, _candidate: &CandidateProfile) -> Result<AxisMatch, AppError> {
        // Simplified: placeholder for KPI matching
        Ok(AxisMatch {
            axis_code: "output_kpi".to_string(),
            match_percentage: Score::new(65.0).unwrap_or_default(),
            gap_severity: GapSeverity::Acceptable,
            details: vec![],
        })
    }

    fn match_business_gap_axis(&self, _graph: &PositionGraph, _candidate: &CandidateProfile) -> Result<AxisMatch, AppError> {
        Ok(AxisMatch {
            axis_code: "business_gap".to_string(),
            match_percentage: Score::new(70.0).unwrap_or_default(),
            gap_severity: GapSeverity::Acceptable,
            details: vec![],
        })
    }

    fn match_work_style_axis(&self, _graph: &PositionGraph, candidate: &CandidateProfile) -> Result<AxisMatch, AppError> {
        let score = candidate.big_five.as_ref()
            .map(|bf| bf.average())
            .unwrap_or(50.0);

        let severity = if score >= 75.0 { GapSeverity::Aligned }
            else if score >= 50.0 { GapSeverity::Acceptable }
            else { GapSeverity::Development };

        Ok(AxisMatch {
            axis_code: "work_style".to_string(),
            match_percentage: Score::new_unchecked(score),
            gap_severity: severity,
            details: vec![],
        })
    }

    fn match_growth_motivation_axis(&self, _graph: &PositionGraph, _candidate: &CandidateProfile) -> Result<AxisMatch, AppError> {
        Ok(AxisMatch {
            axis_code: "growth_motivation".to_string(),
            match_percentage: Score::new(60.0).unwrap_or_default(),
            gap_severity: GapSeverity::Acceptable,
            details: vec![],
        })
    }

    // ─── Composite Calculation ───

    fn calculate_composite(
        &self,
        capability: &AxisMatch,
        output_kpi: &AxisMatch,
        business_gap: &AxisMatch,
        work_style: &AxisMatch,
        growth: &AxisMatch,
        graph: &PositionGraph,
    ) -> Score {
        let mut total = 0.0;
        let mut weight_sum = 0.0;

        for axis in &graph.axes {
            let match_pct = match axis.code {
                genflow_receptors::AxisCode::Capability => capability.match_percentage.value(),
                genflow_receptors::AxisCode::OutputKpi => output_kpi.match_percentage.value(),
                genflow_receptors::AxisCode::BusinessGap => business_gap.match_percentage.value(),
                genflow_receptors::AxisCode::WorkStyle => work_style.match_percentage.value(),
                genflow_receptors::AxisCode::GrowthMotivation => growth.match_percentage.value(),
            };
            total += match_pct * axis.weight;
            weight_sum += axis.weight;
        }

        if weight_sum > 0.0 {
            Score::new_unchecked(total / weight_sum)
        } else {
            Score::default()
        }
    }

    // ─── Risk Flags ───

    fn identify_risk_flags(&self, work_style: &AxisMatch, candidate: &CandidateProfile) -> Vec<RiskFlag> {
        let mut flags = Vec::new();

        if work_style.match_percentage.is_low() {
            flags.push(RiskFlag {
                code: "work_style_low".to_string(),
                severity: FlagSeverity::Attention,
                description: "Work style alignment below threshold".to_string(),
                mitigation: "Consider team dynamics training or mentorship".to_string(),
            });
        }

        if let Some(bf) = &candidate.big_five {
            if bf.neuroticism.is_high() {
                flags.push(RiskFlag {
                    code: "stress_sensitivity".to_string(),
                    severity: FlagSeverity::Info,
                    description: "Higher stress sensitivity score".to_string(),
                    mitigation: "Ensure adequate support structure".to_string(),
                });
            }
        }

        flags
    }

    // ─── Data Loading ───

    async fn load_position_graph(&self, position_id: Uuid) -> Result<PositionGraph, AppError> {
        // Load from DB — simplified for now
        Ok(PositionGraph {
            position_id,
            version: "1.0".to_string(),
            axes: vec![], // will be populated from DB in real impl
            calibration_notes: None,
        })
    }

    async fn load_candidate_profile(&self, candidate_id: Uuid) -> Result<CandidateProfile, AppError> {
        // Load from DB — simplified for now
        Ok(CandidateProfile {
            candidate_id,
            big_five: None,
            riasec: None,
            skills: std::collections::HashMap::new(),
            experience_years: None,
        })
    }

    async fn save_match(
        &self,
        position_id: Uuid,
        candidate_id: Uuid,
        capability: &AxisMatch,
        output_kpi: &AxisMatch,
        business_gap: &AxisMatch,
        work_style: &AxisMatch,
        growth: &AxisMatch,
        composite: Score,
    ) -> Result<Uuid, AppError> {
        let match_id = Uuid::new_v4();

        sqlx::query(
            "INSERT INTO job_matches (id, position_id, candidate_id, capability_match, output_kpi_match, business_gap_match, work_style_alignment, growth_motivation_match, composite_index, confidence_score, status, human_review_required, calculated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)"
        )
            .bind(match_id)
            .bind(position_id)
            .bind(candidate_id)
            .bind(capability.match_percentage.value())
            .bind(output_kpi.match_percentage.value())
            .bind(business_gap.match_percentage.value())
            .bind(work_style.match_percentage.value())
            .bind(growth.match_percentage.value())
            .bind(composite.value())
            .bind(Score::new(85.0).unwrap_or_default().value())
            .bind(MatchStatus::PendingReview.as_db_str())
            .bind(true)
            .bind(chrono::Utc::now())
            .execute(&self.pool)
            .await?;

        Ok(match_id)
    }
}

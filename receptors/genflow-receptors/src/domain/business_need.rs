//! Business Need Discovery Domain

use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum BusinessNeedType {
    CapabilityGap,      // کمبود توانایی
    ProcessBottleneck,  // گلوگاه فرایند
    GrowthOpportunity,  // فرصت رشد
    RiskMitigation,     // کاهش ریسک
    DirectPositionRequest, // درخواست مستقیم
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum NeedUrgency {
    Immediate,  // بلوکه‌کننده (Blocker)
    ShortTerm,  // ۱-۳ ماه
    MediumTerm, // ۳-۱۲ ماه
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BusinessNeed {
    pub need_id: String,
    pub need_type: BusinessNeedType,
    pub description: String,
    pub related_process: Option<String>,
    pub related_capabilities: Vec<String>,
    pub urgency: NeedUrgency,
    pub evidence: Vec<String>,
    pub source_mcp_id: Option<Uuid>,
}

impl BusinessNeed {
    pub fn new(
        need_type: BusinessNeedType,
        description: impl Into<String>,
        urgency: NeedUrgency,
    ) -> Self {
        Self {
            need_id: format!("NEED-{}", &Uuid::new_v4().to_string()[..8]),
            need_type,
            description: description.into(),
            related_process: None,
            related_capabilities: vec![],
            urgency,
            evidence: vec![],
            source_mcp_id: None,
        }
    }

    /// آیا این نیاز مستقیماً به یک پوزیشن شغلی ختم می‌شود؟
    pub fn implies_position(&self) -> bool {
        matches!(
            self.need_type,
            BusinessNeedType::CapabilityGap |
            BusinessNeedType::ProcessBottleneck |
            BusinessNeedType::DirectPositionRequest
        )
    }

    /// اولویت عددی برای sorting (هرچه کمتر، فوری‌تر)
    pub fn priority_score(&self) -> u8 {
        match self.urgency {
            NeedUrgency::Immediate => 1,
            NeedUrgency::ShortTerm => 2,
            NeedUrgency::MediumTerm => 3,
        }
    }
}

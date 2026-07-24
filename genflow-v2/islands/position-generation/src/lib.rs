//! genflow-position-generation — Position Generation Island
//!
//! Business analysis → Need discovery → Graph → Calibration → Position generation

pub mod services;

pub use services::{
    BusinessAnalysisEngine,
    BusinessNeedDiscovery,
    PositionGraphBuilder,
    RepresentativeCalibrator,
    PositionGenerationEngine,
};

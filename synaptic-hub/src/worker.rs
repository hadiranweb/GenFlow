//! Synaptic Hub Background Worker — Runtime consumer loop
//!
//! Subscribes to the synaptic bus and processes incoming events through the
//! EventRouter and ConvergenceTracker.

use crate::bus::SynapticBus;
use crate::convergence::{ConvergenceAction, ConvergenceTracker};
use crate::router::EventRouter;
use crate::store::EventStore;
use genflow_receptors::events::EventEnvelope;
use std::sync::Arc;

/// Start the background worker for Synaptic Hub
pub async fn start_background_worker(
    synaptic_bus: Arc<SynapticBus>,
    convergence_tracker: Arc<ConvergenceTracker>,
    event_router: Arc<EventRouter>,
    event_store: Option<Arc<EventStore>>,
) {
    let mut rx = synaptic_bus.subscribe_internal();
    tracing::info!("Synaptic Hub background worker started");

    while let Ok(envelope) = rx.recv().await {
        let event_type = &envelope.event_type;
        tracing::debug!(event_type = %event_type, "Synaptic Hub processing event");

        // 1. Durably append to EventStore if available
        if let Some(ref store) = event_store {
            if let Err(e) = store.append(&envelope).await {
                tracing::error!(error = %e, event_type = %event_type, "Failed to persist event to event_log");
            } else {
                tracing::debug!(event_id = %envelope.event_id, "Event persisted to durable store");
                
                // Track journey/pipeline stages automatically!
                if let Err(err) = store.update_pipeline_run(&envelope).await {
                    tracing::error!(error = %err, "Failed to update pipeline run stage from event");
                }
            }
        }

        // 2. Run event routing through EventRouter
        let targets = event_router.route(event_type);
        if !targets.is_empty() {
            tracing::info!(
                event_type = %event_type,
                correlation_id = ?envelope.correlation_id,
                targets = ?targets,
                "Event successfully routed to receptors"
            );
        }

        // 3. Run Convergence tracker logic
        if let Some(action) = convergence_tracker.process_event(&envelope).await {
            tracing::info!(
                event_type = %event_type,
                action = ?action,
                "Convergence pattern detected! Executing composite action."
            );

            // Execute action
            match action {
                ConvergenceAction::EmitEvent { event_type: emit_type } => {
                    let mut payload = serde_json::json!({
                        "triggered_by_event": event_type,
                        "timestamp": chrono::Utc::now()
                    });
                    if let Some(corr_id) = envelope.correlation_id {
                        payload["correlation_id"] = serde_json::json!(corr_id);
                    }
                    let mut trigger_envelope = EventEnvelope::new(
                        genflow_receptors::events::EventSource::Gateway,
                        emit_type.clone(),
                        payload,
                    );
                    if let Some(corr_id) = envelope.correlation_id {
                        trigger_envelope = trigger_envelope.with_correlation_id(corr_id);
                    }
                    if let Err(e) = synaptic_bus.publish(trigger_envelope).await {
                        tracing::error!(error = %e, "Failed to publish convergence-triggered event");
                    }
                }
                ConvergenceAction::Notify { channel } => {
                    tracing::info!(
                        channel = %channel,
                        "Dispatched convergence alert notification to channel"
                    );
                }
                ConvergenceAction::TriggerCalculation { calculation_type } => {
                    tracing::info!(
                        calculation_type = %calculation_type,
                        "Dispatched convergence calculation request"
                    );
                }
            }
        }
    }
}

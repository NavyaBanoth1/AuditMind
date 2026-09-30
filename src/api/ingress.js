/**
 * Normalized Ingress Interface (/api/webhooks/ingress)
 * Ingests external AWS CloudTrail, Jira, and GitHub events, normalizes them into compliance memory items,
 * and feeds them directly into the Autonomous Event Loop Engine.
 */

const express = require('express');
const router = express.Router();
const hindsightService = require('../memory/hindsightService');
const { mapControlAcrossFrameworks } = require('../compliance/frameworkMapper');
const { processAutonomousEvent } = require('../compliance/eventLoopEngine');
const { cleanAndParseJson } = require('../utils/jsonSanitizer');

router.post('/ingress', async (req, res) => {
    try {
        const body = cleanAndParseJson(req.body, req.body);
        const { source, event_type, tenant_bank_id, payload } = body || {};

        if (!source || !payload) {
            return res.status(400).json({
                error: "Invalid ingress payload. Mandatory fields: source, payload."
            });
        }

        const targetBankId = hindsightService.resolveBankId(tenant_bank_id);
        let normalizedContent = "";
        let eventMetadata = {
            source,
            event_type: event_type || "generic_event",
            ingested_at: new Date().toISOString()
        };

        // 1. AWS CloudTrail Ingress Normalization
        if (source.toLowerCase().includes('cloudtrail') || source.toLowerCase().includes('aws')) {
            const eventName = payload.eventName || "AWS_Action";
            const user = payload.userIdentity?.userName || payload.userIdentity?.arn || "Unknown_AWS_User";
            const isEncrypted = payload.responseElements?.encrypted;
            const resourceId = payload.requestParameters?.dBSnapshotIdentifier || payload.requestParameters?.dBInstanceIdentifier || "AWS_Resource";
            
            const crossFramework = mapControlAcrossFrameworks(eventName.includes('Snapshot') ? 'DATA_ENCRYPTION_REST' : 'AUDIT_LOGGING_MONITORING');

            normalizedContent = `[AWS CloudTrail Ingress] Event: ${eventName} by User: ${user}. Resource: ${resourceId}. Encryption Status: ${isEncrypted === false ? 'UNENCRYPTED (VIOLATION)' : isEncrypted === true ? 'Encrypted' : 'N/A'}. Timestamp: ${payload.eventTime || new Date().toISOString()}. Cross-Framework Mappings: ISO 27001 (${crossFramework.ISO_27001}), SOC 2 (${crossFramework.SOC_2}), India DPDP Act (${crossFramework.DPDP_ACT}).`;
            eventMetadata.resource_id = resourceId;
            eventMetadata.user = user;
            eventMetadata.encryption_status = String(isEncrypted);
        }
        // 2. Jira Ingress Normalization
        else if (source.toLowerCase().includes('jira')) {
            const ticketId = payload.ticket_id || payload.key || "JIRA-TICKET";
            const status = payload.status || "Updated";
            const assignee = payload.assignee || "Unassigned";
            const evidenceAttached = payload.evidence_attached || (payload.attachments && payload.attachments.length > 0) || false;
            
            const crossFramework = mapControlAcrossFrameworks('PRIVILEGED_ACCESS_REVIEW');

            normalizedContent = `[Jira Webhook Ingress] Ticket: ${ticketId} Status: ${status} Assignee: ${assignee}. Remediation Evidence Attached: ${evidenceAttached ? 'YES' : 'NO (FAKE FIX RISK)'}. Description: ${payload.summary || payload.description || 'N/A'}. Cross-Framework Mappings: ISO 27001 (${crossFramework.ISO_27001}), SOC 2 (${crossFramework.SOC_2}).`;
            eventMetadata.ticket_id = ticketId;
            eventMetadata.status = status;
            eventMetadata.evidence_attached = evidenceAttached;
        }
        // 3. GitHub Ingress Normalization
        else if (source.toLowerCase().includes('github')) {
            const repo = payload.repository || "Repository";
            const action = payload.action || "push";
            const actor = payload.sender || payload.pusher || "Developer";
            
            normalizedContent = `[GitHub Webhook Ingress] Repo: ${repo} Action: ${action} Actor: ${actor}. PR Approvals Validated: ${payload.pr_approved ? 'YES' : 'NO'}. Timestamp: ${new Date().toISOString()}.`;
            eventMetadata.repo = repo;
            eventMetadata.actor = actor;
        }
        // Fallback Generic Event Ingress
        else {
            normalizedContent = `[Generic Ingress Event] Source: ${source}. Event: ${event_type || 'Custom'}. Payload Summary: ${JSON.stringify(payload).slice(0, 300)}`;
        }

        // Autonomous Event Loop Processing
        const loopResult = await processAutonomousEvent({
            source,
            event_type: event_type || "webhook_ingress",
            tenant_bank_id: targetBankId,
            summary: normalizedContent,
            payload
        });

        return res.status(200).json({
            success: true,
            tenant_bank_id: targetBankId,
            source,
            normalized_content: normalizedContent,
            autonomous_loop_result: loopResult
        });

    } catch (error) {
        console.error('[Ingress Router Error]:', error);
        return res.status(500).json({
            error: "Ingress processing failed.",
            details: error.message
        });
    }
});

module.exports = router;

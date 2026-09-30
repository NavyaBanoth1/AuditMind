/**
 * AuditMind Express Backend Server
 * Exposes API endpoints and serves static frontend UI:
 * - Static UI (`public/index.html`)
 * - GET /api/export/evidence-package (Export Audit Evidence Package)
 * - GET /api/memory/conflict-drawer (Conflict Resolution Drawer)
 * - GET /api/demo/controls (Demo / Testing Controls Bar Metadata)
 * - POST /api/demo/trigger/contradiction (Inject Contradiction Trap)
 * - POST /api/demo/trigger/aud-402 (Trigger #AUD-402 Overdue IAM Finding)
 * - POST /api/demo/trigger/dpdp-amendment (Upload DPDP Retention Amendment)
 * - GET /api/memory/inspector (Live Hindsight Memory Inspector)
 * - GET /api/event-feed (Unified Event Feed)
 * - POST /api/webhooks/ingress (Normalized Event Webhook Ingress)
 * - GET /api/approvals (Human-in-the-Loop Approvals Queue)
 * - POST /api/approve (Approve queued action)
 * - POST /api/reject (Reject queued action)
 * - GET /api/readiness (Audit Readiness Score Breakdown)
 * - POST /api/ingest (Document/Log Ingestion Dropzone)
 * - POST /api/compliance/regulatory-impact (Hero Feature 1: Regulatory Impact & Cross-Mapping)
 * - POST /api/audit/rehearsal/initiate (Hero Feature 2: Mock-Audit Rehearsal & Radar Chart)
 * - POST /api/audit/rehearsal/evaluate (Hero Feature 2: Practice Response Scoring & Retention)
 * - POST /api/learning/feedback (Hero Feature 3: Feedback Handlers & Dynamic Readiness Score)
 * - POST /api/learning/memory-toggle (Hero Feature 3: Memory ON/OFF Side-by-Side Comparison)
 * - POST /api/learning/time-travel (Hero Feature 3: Temporal Time-Travel Query Filter)
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const ingestRouter = require('./api/ingest');
const ingressRouter = require('./api/ingress');
const exportRouter = require('./api/export');
const { analyzeRegulatoryImpact } = require('./compliance/regulatoryEngine');
const { initiateMockAuditRehearsal, evaluateRehearsalResponse } = require('./compliance/mockAuditEngine');
const { submitFeedback, compareMemoryToggle, executeTemporalTimeTravelQuery, calculateAndRetainReadinessScore } = require('./compliance/learningCurveEngine');
const { getEventFeed, getApprovalsQueue, handleApprovalDecision, checkDeadlineWatcher } = require('./compliance/eventLoopEngine');
const { DEMO_BUTTONS, triggerInjectContradiction, triggerOverdueAud402, triggerUploadDpdpAmendment, getMemoryInspectorData } = require('./compliance/demoTriggerEngine');
const { resolveConflictDrawer } = require('./compliance/conflictResolver');
const { cleanAndParseJson } = require('./utils/jsonSanitizer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from public/
app.use(express.static(path.join(__dirname, '../public')));

// Health Check Endpoint
app.get('/api/health', async (req, res) => {
    try {
        const tenantBankId = process.env.DEFAULT_TENANT_BANK_ID || "tenant-acme-audit";
        const readiness = await calculateAndRetainReadinessScore(tenantBankId, "Health check readiness query");

        res.json({
            status: "ok",
            service: "AuditMind Backend Engine",
            hindsight_url: process.env.HINDSIGHT_URL || "http://localhost:8888",
            default_tenant_bank_id: tenantBankId,
            readiness_score: readiness.readiness_score,
            readiness_breakdown: readiness.breakdown,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.status(500).json({ error: "Health check readiness evaluation error", details: err.message });
    }
});

// Mounting Ingestion, Webhook & Export Routers
app.use('/api', ingestRouter);
app.use('/api/webhooks', ingressRouter);
app.use('/api/export', exportRouter);

// Conflict Resolution Drawer Endpoint
app.get('/api/memory/conflict-drawer', async (req, res) => {
    try {
        const tenantBankId = req.query.tenant_bank_id || process.env.DEFAULT_TENANT_BANK_ID || "tenant-acme-audit";
        const conflictData = await resolveConflictDrawer(tenantBankId);
        return res.json({ success: true, conflict: conflictData });
    } catch (err) {
        return res.status(500).json({ error: "Conflict drawer query failed.", details: err.message });
    }
});

// DEMO / TESTING CONTROLS ENDPOINTS
app.get('/api/demo/controls', (req, res) => {
    res.json({
        header_label: "Demo / Testing Controls Bar",
        description: "Presentation execution triggers for live planted traps and memory updates.",
        buttons: DEMO_BUTTONS
    });
});

app.post('/api/demo/trigger/contradiction', async (req, res) => {
    try {
        const body = cleanAndParseJson(req.body, req.body);
        const tenantBankId = body?.tenant_bank_id || process.env.DEFAULT_TENANT_BANK_ID || "tenant-acme-audit";
        const result = await triggerInjectContradiction(tenantBankId);
        return res.json({ success: true, result });
    } catch (err) {
        return res.status(500).json({ error: "Contradiction trigger failed.", details: err.message });
    }
});

app.post('/api/demo/trigger/aud-402', async (req, res) => {
    try {
        const body = cleanAndParseJson(req.body, req.body);
        const tenantBankId = body?.tenant_bank_id || process.env.DEFAULT_TENANT_BANK_ID || "tenant-acme-audit";
        const result = await triggerOverdueAud402(tenantBankId);
        return res.json({ success: true, result });
    } catch (err) {
        return res.status(500).json({ error: "AUD-402 trigger failed.", details: err.message });
    }
});

app.post('/api/demo/trigger/dpdp-amendment', async (req, res) => {
    try {
        const body = cleanAndParseJson(req.body, req.body);
        const tenantBankId = body?.tenant_bank_id || process.env.DEFAULT_TENANT_BANK_ID || "tenant-acme-audit";
        const result = await triggerUploadDpdpAmendment(tenantBankId);
        return res.json({ success: true, result });
    } catch (err) {
        return res.status(500).json({ error: "DPDP amendment trigger failed.", details: err.message });
    }
});

// Hindsight Memory Inspector Endpoint
app.get('/api/memory/inspector', async (req, res) => {
    try {
        const tenantBankId = req.query.tenant_bank_id || process.env.DEFAULT_TENANT_BANK_ID || "tenant-acme-audit";
        const inspectorData = await getMemoryInspectorData(tenantBankId);
        return res.json({ success: true, inspector: inspectorData });
    } catch (err) {
        return res.status(500).json({ error: "Memory inspector query failed.", details: err.message });
    }
});

// REST API 1: Unified Event Feed Endpoint
app.get('/api/event-feed', (req, res) => {
    const tenantBankId = req.query.tenant_bank_id || process.env.DEFAULT_TENANT_BANK_ID || "tenant-acme-audit";
    const feed = getEventFeed(tenantBankId);
    res.json({
        success: true,
        tenant_bank_id: tenantBankId,
        event_count: feed.length,
        events: feed
    });
});

// REST API 2: Human-in-the-Loop Approvals Queue Endpoint
app.get('/api/approvals', async (req, res) => {
    const tenantBankId = req.query.tenant_bank_id || process.env.DEFAULT_TENANT_BANK_ID || "tenant-acme-audit";
    await checkDeadlineWatcher(tenantBankId);
    const queue = getApprovalsQueue(tenantBankId);
    res.json({
        success: true,
        tenant_bank_id: tenantBankId,
        pending_count: queue.filter(q => q.status === 'PENDING_HUMAN_APPROVAL').length,
        approvals_queue: queue
    });
});

// REST API 3: Approve Action Endpoint
app.post('/api/approve', async (req, res) => {
    try {
        const body = cleanAndParseJson(req.body, req.body);
        const { tenant_bank_id, approval_id, comments } = body || {};

        if (!approval_id) {
            return res.status(400).json({ error: "Invalid request. Mandatory field: approval_id." });
        }

        const result = await handleApprovalDecision(tenant_bank_id, approval_id, "APPROVE", comments);
        return res.json({ success: true, decision: result });

    } catch (error) {
        return res.status(500).json({ error: "Approval failed.", details: error.message });
    }
});

// REST API 4: Reject Action Endpoint
app.post('/api/reject', async (req, res) => {
    try {
        const body = cleanAndParseJson(req.body, req.body);
        const { tenant_bank_id, approval_id, comments } = body || {};

        if (!approval_id) {
            return res.status(400).json({ error: "Invalid request. Mandatory field: approval_id." });
        }

        const result = await handleApprovalDecision(tenant_bank_id, approval_id, "REJECT", comments);
        return res.json({ success: true, decision: result });

    } catch (error) {
        return res.status(500).json({ error: "Rejection failed.", details: error.message });
    }
});

// REST API 5: Audit Readiness Score Breakdown Endpoint
app.get('/api/readiness', async (req, res) => {
    try {
        const tenantBankId = req.query.tenant_bank_id || process.env.DEFAULT_TENANT_BANK_ID || "tenant-acme-audit";
        const readiness = await calculateAndRetainReadinessScore(tenantBankId, "Readiness query");
        return res.json({
            success: true,
            readiness
        });
    } catch (error) {
        return res.status(500).json({ error: "Readiness query failed.", details: error.message });
    }
});

// Hero Feature 1 Endpoint: Regulatory Impact Analysis
app.post('/api/compliance/regulatory-impact', async (req, res) => {
    try {
        const body = cleanAndParseJson(req.body, req.body);
        const { tenant_bank_id, amendment_text, amendment_name } = body || {};

        if (!amendment_text) {
            return res.status(400).json({
                error: "Invalid request. Mandatory field: amendment_text."
            });
        }

        const analysis = await analyzeRegulatoryImpact(
            tenant_bank_id,
            amendment_text,
            amendment_name || "Uploaded Regulatory Amendment"
        );

        return res.status(200).json({
            success: true,
            analysis
        });

    } catch (error) {
        console.error('[Regulatory Impact API Error]:', error);
        return res.status(500).json({
            error: "Regulatory impact analysis failed.",
            details: error.message
        });
    }
});

// Hero Feature 2 Endpoint: Initiate Mock-Audit Rehearsal & Radar Chart
app.post('/api/audit/rehearsal/initiate', async (req, res) => {
    try {
        const body = cleanAndParseJson(req.body, req.body);
        const { tenant_bank_id, persona_key } = body || {};

        const rehearsalData = await initiateMockAuditRehearsal(tenant_bank_id, persona_key);

        return res.status(200).json({
            success: true,
            rehearsal: rehearsalData
        });

    } catch (error) {
        console.error('[Mock Audit Initiate Error]:', error);
        return res.status(500).json({
            error: "Mock audit initiation failed.",
            details: error.message
        });
    }
});

// Hero Feature 2 Endpoint: Evaluate Response & Retain Rehearsal Performance
app.post('/api/audit/rehearsal/evaluate', async (req, res) => {
    try {
        const body = cleanAndParseJson(req.body, req.body);
        const { tenant_bank_id, question_id, user_answer, evidence_attached, persona_key } = body || {};

        if (!user_answer) {
            return res.status(400).json({
                error: "Invalid request. Mandatory field: user_answer."
            });
        }

        const evaluation = await evaluateRehearsalResponse(tenant_bank_id, {
            question_id,
            user_answer,
            evidence_attached,
            persona_key
        });

        return res.status(200).json({
            success: true,
            evaluation
        });

    } catch (error) {
        console.error('[Mock Audit Evaluation Error]:', error);
        return res.status(500).json({
            error: "Mock audit evaluation failed.",
            details: error.message
        });
    }
});

// Hero Feature 3 Endpoint: User Feedback Handler & Dynamic Readiness Score
app.post('/api/learning/feedback', async (req, res) => {
    try {
        const body = cleanAndParseJson(req.body, req.body);
        const { tenant_bank_id, finding_id, feedback_type, comments, agent_output_context } = body || {};

        const feedbackResult = await submitFeedback(tenant_bank_id, {
            finding_id,
            feedback_type,
            comments,
            agent_output_context
        });

        return res.status(200).json({
            success: true,
            feedback: feedbackResult
        });

    } catch (error) {
        console.error('[Feedback Endpoint Error]:', error);
        return res.status(500).json({
            error: "Feedback submission failed.",
            details: error.message
        });
    }
});

// Hero Feature 3 Endpoint: Memory ON / OFF Side-by-Side Comparison
app.post('/api/learning/memory-toggle', async (req, res) => {
    try {
        const body = cleanAndParseJson(req.body, req.body);
        const { tenant_bank_id, query } = body || {};

        const comparison = await compareMemoryToggle(tenant_bank_id, query || "Are database snapshots encrypted?");

        return res.status(200).json({
            success: true,
            comparison
        });

    } catch (error) {
        console.error('[Memory Toggle Endpoint Error]:', error);
        return res.status(500).json({
            error: "Memory toggle comparison failed.",
            details: error.message
        });
    }
});

// Hero Feature 3 Endpoint: Temporal Time-Travel Query Filter
app.post('/api/learning/time-travel', async (req, res) => {
    try {
        const body = cleanAndParseJson(req.body, req.body);
        const { tenant_bank_id, query, target_date } = body || {};

        const timeTravelResult = await executeTemporalTimeTravelQuery(
            tenant_bank_id,
            query || "What was our database backup policy?",
            target_date || "2025-03-15"
        );

        return res.status(200).json({
            success: true,
            time_travel: timeTravelResult
        });

    } catch (error) {
        console.error('[Time Travel Endpoint Error]:', error);
        return res.status(500).json({
            error: "Temporal time travel query failed.",
            details: error.message
        });
    }
});

if (require.main === module) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 AuditMind Backend Engine running on http://0.0.0.0:${PORT}`);
    });
}

module.exports = app;

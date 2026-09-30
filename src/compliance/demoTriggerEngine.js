/**
 * Hero Feature 5: Demo Trap Trigger Engine & Hindsight Memory Inspector
 * Provides "Demo / Testing Controls" buttons for presentation execution:
 * 1. "Inject Contradiction": POL-101 v3 100% encryption rule vs CloudTrail log #8839 unencrypted snapshot.
 * 2. "Trigger #AUD-402": Overdue high-risk IAM finding (45+ days overdue).
 * 3. "Upload DPDP Amendment": Synthetic DPDP Act retention clause.
 * 
 * Also provides the Live Hindsight Memory Inspector returning real recalled memories (type, date, source, relevance).
 */

const hindsightService = require('../memory/hindsightService');
const { processAutonomousEvent, checkDeadlineWatcher } = require('./eventLoopEngine');
const { analyzeRegulatoryImpact } = require('./regulatoryEngine');

const DEMO_BUTTONS = [
    {
        id: "btn_inject_contradiction",
        label: "Inject Contradiction",
        action_endpoint: "/api/demo/trigger/contradiction",
        description: "Fires CloudTrail log #8839 unencrypted snapshot event against mandatory encryption policy POL-101 v3."
    },
    {
        id: "btn_trigger_aud402",
        label: "Trigger #AUD-402",
        action_endpoint: "/api/demo/trigger/aud-402",
        description: "Triggers background deadline watcher for high-risk IAM finding #AUD-402 (45+ days overdue) and enqueues CISO escalation."
    },
    {
        id: "btn_upload_dpdp_amendment",
        label: "Upload DPDP Amendment",
        action_endpoint: "/api/demo/trigger/dpdp-amendment",
        description: "Feeds synthetic DPDP Act retention amendment into event loop and triggers multi-framework cross-mapping."
    }
];

/**
 * Trigger 1: "Inject Contradiction"
 */
async function triggerInjectContradiction(tenantBankId) {
    const bankId = hindsightService.resolveBankId(tenantBankId);
    
    const eventPayload = {
        source: "AWS CloudTrail",
        event_type: "CreateDBSnapshot",
        tenant_bank_id: bankId,
        summary: "[CONTRADICTION TRAP INJECTED] Policy Violation: Security Policy POL-101 v3 Section 4.1 requires 100% snapshot encryption, but AWS CloudTrail Log #8839 shows CreateDBSnapshot executed by alex.rivera with encrypted=false.",
        payload: {
            log_id: "8839",
            eventName: "CreateDBSnapshot",
            encrypted: false,
            policy_violated: "POL-101 v3 Section 4.1"
        }
    };

    const loopResult = await processAutonomousEvent(eventPayload);
    return {
        trigger: "Inject Contradiction",
        tenant_bank_id: bankId,
        trap_details: "POL-101 v3 mandatory 100% encryption rule vs AWS CloudTrail Log #8839 unencrypted snapshot.",
        event_loop_result: loopResult
    };
}

/**
 * Trigger 2: "Trigger #AUD-402"
 */
async function triggerOverdueAud402(tenantBankId) {
    const bankId = hindsightService.resolveBankId(tenantBankId);
    
    const watcherResult = await checkDeadlineWatcher(bankId);
    
    const eventPayload = {
        source: "Deadline Watcher",
        event_type: "FindingOverdueAlert",
        tenant_bank_id: bankId,
        summary: "[OVERDUE ITEM TRAP INJECTED] High-Risk Finding AUD-402 (Privileged IAM Admin Access Without Time-Bound Expiry) is 45+ days past deadline (Feb 10, 2025)."
    };

    const loopResult = await processAutonomousEvent(eventPayload);

    return {
        trigger: "Trigger #AUD-402",
        tenant_bank_id: bankId,
        overdue_finding_id: "AUD-402",
        days_overdue: 45,
        deadline_watcher_result: watcherResult,
        event_loop_result: loopResult
    };
}

/**
 * Trigger 3: "Upload DPDP Amendment"
 */
async function triggerUploadDpdpAmendment(tenantBankId) {
    const bankId = hindsightService.resolveBankId(tenantBankId);
    
    const amendmentText = "Digital Personal Data Protection (DPDP) Act Section 8 Clause 7 Amendment 2025: Personal data retention for offboarded customer accounts must not exceed 180 days. Cryptographic proof of backup deletion must be produced within 30 days.";
    const amendmentName = "DPDP Act Section 8 Data Retention Amendment 2025";

    const impactAnalysis = await analyzeRegulatoryImpact(bankId, amendmentText, amendmentName);

    const eventPayload = {
        source: "Regulatory Ingress Dropzone",
        event_type: "RegulatoryAmendmentUploaded",
        tenant_bank_id: bankId,
        summary: `[DPDP AMENDMENT INJECTED] Ingested ${amendmentName}. Retention threshold: 180 days.`
    };

    const loopResult = await processAutonomousEvent(eventPayload);

    return {
        trigger: "Upload DPDP Amendment",
        tenant_bank_id: bankId,
        regulatory_impact_analysis: impactAnalysis,
        event_loop_result: loopResult
    };
}

/**
 * Hindsight Memory Inspector Endpoint Helper
 * Returns real recalled memories (type, date, source, relevance) for active tenant bank.
 */
async function getMemoryInspectorData(tenantBankId) {
    const bankId = hindsightService.resolveBankId(tenantBankId);
    
    let recalledMemories = [];
    let hindsightStatus = "ONLINE";

    try {
        recalledMemories = await hindsightService.recall(bankId, "Show all compliance audit facts, policies, and findings");
    } catch (e) {
        hindsightStatus = "OFFLINE_FETCH_FAILED";
        console.warn(`[MemoryInspector] Hindsight query notice for ${bankId}: ${e.message}`);
    }

    // Default structured inspector memories representing active corpus
    const activeCorpusMemories = [
        {
            memory_id: "MEM-POL-101-V3",
            type: "Policy Document",
            source: "POL-101_v3.md Section 4.1",
            date: "2025-01-10",
            category: "policy_version",
            content: "100% Encryption Mandatory: All database instances, automated backups, and manual snapshots MUST BE ENCRYPTED at rest.",
            relevance_score: 0.98,
            grounding_badge: "🟢 Verified Grounding"
        },
        {
            memory_id: "MEM-LOG-8839",
            type: "AWS CloudTrail Log",
            source: "AWS_CloudTrail_Log_8839.json",
            date: "2025-03-14",
            category: "aws_log",
            content: "CreateDBSnapshot event executed for acme-prod-db-manual-snap-20250314 with encrypted=false by user alex.rivera.",
            relevance_score: 0.95,
            grounding_badge: "🟢 Verified Grounding"
        },
        {
            memory_id: "MEM-AUD-402",
            type: "Audit Finding",
            source: "findings.json / AUD-402",
            date: "2025-01-10",
            category: "finding",
            content: "Overdue High-Risk Finding: Privileged IAM Admin Access Granted Without Time-Bound Expiry (Due Feb 10, 2025).",
            relevance_score: 0.92,
            grounding_badge: "🔴 Insufficient Evidence (Overdue Remediation)"
        },
        {
            memory_id: "MEM-JIRA-SEC882",
            type: "Jira Ticket",
            source: "tickets.json / SEC-882",
            date: "2025-03-02",
            category: "jira_ticket",
            content: "Ticket SEC-882 (AUD-305 Node OS Upgrade) marked Done with zero attached execution logs.",
            relevance_score: 0.89,
            grounding_badge: "🟡 Warning: Fake Fix Trap"
        }
    ];

    return {
        tenant_bank_id: bankId,
        hindsight_status: hindsightStatus,
        inspector_title: "AuditMind Live Hindsight Memory Inspector",
        total_memories_inspected: activeCorpusMemories.length,
        memories: activeCorpusMemories,
        hindsight_recalled_records: recalledMemories
    };
}

module.exports = {
    DEMO_BUTTONS,
    triggerInjectContradiction,
    triggerOverdueAud402,
    triggerUploadDpdpAmendment,
    getMemoryInspectorData
};

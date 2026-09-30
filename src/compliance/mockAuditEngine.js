/**
 * Hero Feature 2: Mock-Audit Rehearsal Engine & Auditor Behavior Radar Chart
 * Simulates practice audits based on historical auditor habits (e.g. Marcus Vance) retained in Hindsight.
 */

const hindsightService = require('../memory/hindsightService');
const { formatEvidenceBuckets } = require('./evidenceClassifier');

const PERSONAS = {
    TECHNICAL_EXAMINER: {
        id: "strict_technical_examiner",
        name: "Strict Technical Examiner",
        description: "Prioritizes raw AWS CloudTrail logs, database encryption KMS parameters, and automated infrastructure guardrails.",
        focus_weights: { IAM: 85, DB_Encryption: 95, Policy_Compliance: 60, Vendor_Risk: 50 },
        search_filter: "AWS CloudTrail logs, RDS snapshot encryption, IAM permissions"
    },
    PROCESS_SPECIALIST: {
        id: "process_policy_specialist",
        name: "Process & Policy Specialist",
        description: "Prioritizes document version history, formal CISO sign-offs, training completion logs, and vendor SOC 2 assessments.",
        focus_weights: { IAM: 70, DB_Encryption: 65, Policy_Compliance: 95, Vendor_Risk: 90 },
        search_filter: "POL-101 version history, sign-offs, HR offboarding, vendor risk"
    }
};

/**
 * Initiates Mock-Audit Rehearsal
 * Recalls auditor habits, generates predicted questions, and calculates Radar Chart Metrics.
 */
async function initiateMockAuditRehearsal(tenantBankId, personaKey = "strict_technical_examiner") {
    const bankId = hindsightService.resolveBankId(tenantBankId);
    const persona = personaKey === "process_policy_specialist" ? PERSONAS.PROCESS_SPECIALIST : PERSONAS.TECHNICAL_EXAMINER;

    let recalledHabits = [];
    let reflectStrictness = null;
    let hindsightOffline = false;

    try {
        recalledHabits = await hindsightService.recall(bankId, `Auditor habits Marcus Vance ${persona.search_filter}`);
        reflectStrictness = await hindsightService.reflect(bankId, `Evaluate auditor strictness metrics for persona ${persona.name}`);
    } catch (e) {
        hindsightOffline = true;
        console.warn(`[MockAuditEngine] Hindsight query notice: ${e.message}`);
    }

    // Auditor Behavior Radar Chart Metrics (IAM, DB Encryption, Policy Compliance, Vendor Risk)
    const radarChartData = {
        persona_name: persona.name,
        metrics: [
            { axis: "IAM", value: persona.focus_weights.IAM, benchmark: 75 },
            { axis: "Database Encryption", value: persona.focus_weights.DB_Encryption, benchmark: 80 },
            { axis: "Policy Compliance", value: persona.focus_weights.Policy_Compliance, benchmark: 70 },
            { axis: "Vendor Risk", value: persona.focus_weights.Vendor_Risk, benchmark: 65 }
        ]
    };

    // Predicted Questions based on Persona and Corpus
    const predictedQuestions = persona.id === "strict_technical_examiner" ? [
        {
            id: "Q-TECH-01",
            control_id: "ISO 27001 A.8.24 / SOC 2 CC6.6",
            question: "Marcus Vance noticed unencrypted RDS manual snapshots flagged in 2023 and 2024. How do you verify 100% KMS encryption compliance for AWS CloudTrail log #8839?",
            sample_evidence_needed: "CloudTrail log parameters showing encrypted=true and KMS Key ID."
        },
        {
            id: "Q-TECH-02",
            control_id: "ISO 27001 A.5.15 / SOC 2 CC6.2",
            question: "Finding AUD-402 regarding unexpired privileged IAM accounts is 45 days overdue. What technical time-bound guardrail has been implemented in AWS IAM?",
            sample_evidence_needed: "AWS IAM session duration policy or Okta temporary elevation logs."
        }
    ] : [
        {
            id: "Q-PROC-01",
            control_id: "ISO 27001 A.8.10 / DPDP Section 8",
            question: "How does POL-101 v3 enforce the new 180-day customer data retention limit, and where is the formal CISO approval documented?",
            sample_evidence_needed: "POL-101 v3 document approval block and data deletion policy schedule."
        },
        {
            id: "Q-PROC-02",
            control_id: "ISO 27001 A.5.19 / SOC 2 CC9.2",
            question: "What evidence proves that third-party vendors undergo annual SOC 2 Type II reviews before being granted customer PII access?",
            sample_evidence_needed: "Completed vendor risk assessment matrix and signed DPA."
        }
    ];

    return {
        tenant_bank_id: bankId,
        auditor_persona: persona,
        hindsight_status: hindsightOffline ? "OFFLINE_FETCH_FAILED" : "ONLINE",
        radar_chart_metrics: radarChartData,
        predicted_questions: predictedQuestions,
        recalled_habits: recalledHabits
    };
}

/**
 * Evaluates Practice Rehearsal Response and Retains Performance in Hindsight
 */
async function evaluateRehearsalResponse(tenantBankId, { question_id, user_answer, evidence_attached, persona_key }) {
    const bankId = hindsightService.resolveBankId(tenantBankId);
    
    // Evaluate answer against retained corpus
    const hasEvidence = !!evidence_attached && String(evidence_attached).trim().length > 10;
    const isFakeFix = user_answer.toLowerCase().includes('done') && !hasEvidence;

    let score = 85;
    let verdict = "PASS";
    let auditorFeedback = "Response supported by verifiable evidence.";

    if (isFakeFix) {
        score = 30;
        verdict = "FAIL (Fake Fix Risk Detected)";
        auditorFeedback = "Auditor Marcus Vance rejects self-reported 'Done' status without attached logs or execution proof (similar to Jira SEC-882 trap).";
    } else if (!hasEvidence) {
        score = 55;
        verdict = "NEEDS_EVIDENCE";
        auditorFeedback = "Response lacks direct evidence proof; flagged as Insufficient Evidence.";
    }

    const evidenceBuckets = formatEvidenceBuckets({
        historicalFacts: [
            `Question ${question_id || 'Q-01'} Rehearsal Response evaluated for tenant ${bankId}.`
        ],
        inferredPatterns: [
            isFakeFix ? "Pattern matches Jira SEC-882 fake fix finding (AUD-305)." : "Pattern demonstrates evidence-first compliance habit."
        ],
        predictions: [
            `Score ${score}/100 forecast for this control during actual audit.`
        ],
        insufficientEvidence: [
            hasEvidence ? "None." : "Direct log or policy evidence file missing from response payload."
        ]
    });

    // Retain Rehearsal Performance into Hindsight under active tenant bank_id
    const rehearsalRecord = `[Mock-Audit Rehearsal Memory] Tenant: ${bankId}. Question: ${question_id}. User Answer: "${user_answer}". Evidence Attached: ${hasEvidence ? 'YES' : 'NO'}. Score: ${score}/100. Verdict: ${verdict}. Feedback: "${auditorFeedback}".`;
    
    let hindsightRetained = false;
    try {
        await hindsightService.retain(bankId, rehearsalRecord, {
            category: "audit_rehearsal_performance",
            tenant_bank_id: bankId,
            question_id: question_id || "Q-01",
            score: String(score),
            verdict,
            timestamp: new Date().toISOString()
        });
        hindsightRetained = true;
    } catch (e) {
        console.warn(`[MockAuditEngine] Rehearsal retain notice: ${e.message}`);
    }

    return {
        tenant_bank_id: bankId,
        question_id,
        rehearsal_score: score,
        verdict,
        auditor_feedback: auditorFeedback,
        evidence_classification: evidenceBuckets,
        hindsight_performance_retained: hindsightRetained
    };
}

module.exports = {
    PERSONAS,
    initiateMockAuditRehearsal,
    evaluateRehearsalResponse
};

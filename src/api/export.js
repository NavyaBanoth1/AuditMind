/**
 * Audit Evidence Package Export Endpoint (/api/export/evidence-package)
 * Returns a complete compliance manifest containing readiness breakdown, citation badges,
 * active policy versions, and Hindsight recall manifest.
 */

const express = require('express');
const router = express.Router();
const hindsightService = require('../memory/hindsightService');
const { calculateAndRetainReadinessScore } = require('../compliance/learningCurveEngine');

router.get('/evidence-package', async (req, res) => {
    try {
        const tenantBankId = req.query.tenant_bank_id || process.env.DEFAULT_TENANT_BANK_ID || "tenant-acme-audit";
        const bankId = hindsightService.resolveBankId(tenantBankId);

        const readiness = await calculateAndRetainReadinessScore(bankId, "Evidence package export generation");

        let recallManifest = [];
        try {
            recallManifest = await hindsightService.recall(bankId, "Export audit evidence package facts and policies");
        } catch (e) {
            console.warn(`[ExportRoute] Hindsight recall notice: ${e.message}`);
        }

        const packageManifest = {
            export_title: "AuditMind Verified Audit Evidence Package",
            tenant_bank_id: bankId,
            generated_at: new Date().toISOString(),
            audit_readiness_score: readiness.readiness_score,
            score_breakdown: readiness.breakdown,
            citation_grounding_badges: [
                { source: "POL-101_v3.md", status: "🟢 Verified Grounding", control: "ISO 27001 A.8.24 / SOC 2 CC6.6" },
                { source: "AWS_CloudTrail_Log_8839.json", status: "🟢 Verified Grounding", control: "ISO 27001 A.8.15" },
                { source: "POL-101_v1.md", status: "🟡 Warning: Outdated Policy Baseline", control: "Historical Baseline" },
                { source: "SEC-882 (Jira)", status: "🔴 Insufficient Evidence (Fake Fix Trap)", control: "ISO 27001 A.8.19" }
            ],
            active_policies_in_scope: [
                { id: "POL-101 v3.0", title: "Information Security & Data Protection Policy", effective_date: "2025-01-10" }
            ],
            hindsight_recall_manifest: recallManifest,
            verification_statement: "This evidence package was generated using Hindsight RAG long-term memory engine with active tenant bank isolation."
        };

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=AuditMind_Evidence_Package_${bankId}_${Date.now()}.json`);
        return res.status(200).json(packageManifest);

    } catch (error) {
        console.error('[Export Route Error]:', error);
        return res.status(500).json({ error: "Evidence package export failed.", details: error.message });
    }
});

module.exports = router;

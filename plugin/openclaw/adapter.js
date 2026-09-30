/**
 * OpenClaw Plugin Adapter (/plugin/openclaw/adapter.js)
 * Wraps AuditMind memory operations, event ingress, and framework cross-mapping as an OpenClaw plugin.
 */

const hindsightService = require('../../src/memory/hindsightService');
const { mapControlAcrossFrameworks } = require('../../src/compliance/frameworkMapper');

const openClawPlugin = {
    name: "auditmind-compliance-plugin",
    version: "1.0.0",
    description: "OpenClaw modular plugin for Hindsight memory compliance analysis and event ingress.",

    /**
     * OpenClaw plugin initialization lifecycle
     */
    async initialize(config = {}) {
        const tenantBankId = config.tenant_bank_id || process.env.DEFAULT_TENANT_BANK_ID || 'tenant-acme-audit';
        await hindsightService.ensureBankConfig(tenantBankId);
        return { status: "ready", tenant_bank_id: tenantBankId };
    },

    /**
     * OpenClaw action: Ingest compliance event
     */
    async handleIngressEvent(eventData) {
        const { source, payload, tenant_bank_id } = eventData;
        const bankId = hindsightService.resolveBankId(tenant_bank_id);
        const normalizedContent = `[OpenClaw Ingress] ${source}: ${JSON.stringify(payload)}`;
        
        let retainRes = null;
        try {
            retainRes = await hindsightService.retain(bankId, normalizedContent, { source, openclaw: true });
        } catch (e) {
            console.warn(`[OpenClaw Plugin] Hindsight retain fallback: ${e.message}`);
        }

        return {
            success: true,
            tenant_bank_id: bankId,
            retained: !!retainRes
        };
    },

    /**
     * OpenClaw action: Query Hindsight memory with cross-framework mapping
     */
    async queryComplianceMemory(query, tenant_bank_id) {
        const bankId = hindsightService.resolveBankId(tenant_bank_id);
        let recallResults = [];
        let reflectAnswer = null;

        try {
            recallResults = await hindsightService.recall(bankId, query);
            reflectAnswer = await hindsightService.reflect(bankId, query);
        } catch (e) {
            console.warn(`[OpenClaw Plugin] Hindsight query fallback: ${e.message}`);
        }

        const crossFramework = mapControlAcrossFrameworks(query);

        return {
            tenant_bank_id: bankId,
            query,
            cross_framework_mapping: crossFramework,
            recall_results: recallResults,
            reflect_answer: reflectAnswer
        };
    }
};

module.exports = openClawPlugin;

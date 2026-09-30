/**
 * Hindsight Memory Foundation Service
 * Uses official @vectorize-io/hindsight-client SDK
 * Enforces dynamic multi-tenancy and official bank directives & mission.
 */

const { HindsightClient } = require('@vectorize-io/hindsight-client');
require('dotenv').config();

class HindsightService {
    constructor() {
        this.baseUrl = process.env.HINDSIGHT_URL || 'http://localhost:8888';
        this.apiKey = process.env.HINDSIGHT_API_KEY || '';
        this.client = new HindsightClient({
            baseUrl: this.baseUrl,
            apiKey: this.apiKey || undefined
        });
        
        // Track initialized bank configurations
        this.configuredBanks = new Set();
    }

    /**
     * Resolves tenant-isolated bank_id.
     * Prevents memory leakage across multi-tenant clients.
     */
    resolveBankId(tenantBankId) {
        if (!tenantBankId || typeof tenantBankId !== 'string') {
            return process.env.DEFAULT_TENANT_BANK_ID || 'tenant-acme-audit';
        }
        return tenantBankId.trim();
    }

    /**
     * Configures mandatory bank mission & directives using official SDK.
     */
    async ensureBankConfig(tenantBankId) {
        const bankId = this.resolveBankId(tenantBankId);
        if (this.configuredBanks.has(bankId)) {
            return bankId;
        }

        try {
            // Update bank configuration using documented SDK method updateBankConfig
            if (typeof this.client.updateBankConfig === 'function') {
                await this.client.updateBankConfig(bankId, {
                    reflectMission: "Act as an uncompromising Lead Enterprise Compliance Auditor.",
                    dispositionSkepticism: 4,
                    dispositionLiteralism: 4,
                    dispositionEmpathy: 2
                });
            }

            // Create mandatory bank directives if createDirective is available
            if (typeof this.client.createDirective === 'function') {
                try {
                    await this.client.createDirective(
                        bankId,
                        "Evidence Mandatory Directive",
                        "Always cite source documents; never mark compliant without direct evidence; label unverified claims as insufficient evidence."
                    );
                } catch (e) {
                    // Ignore duplicate directive error if already exists
                }
            }

            this.configuredBanks.add(bankId);
        } catch (error) {
            console.warn(`[HindsightService] Non-blocking setup warning for bank ${bankId}:`, error.message);
        }

        return bankId;
    }

    /**
     * Documented retain() operation: Store memories into dynamic tenant bank
     */
    async retain(tenantBankId, content, metadata = {}) {
        const bankId = await this.ensureBankConfig(tenantBankId);
        try {
            return await this.client.retain(bankId, content, metadata);
        } catch (error) {
            console.error(`[HindsightService] retain error on bank ${bankId}:`, error.message);
            throw error;
        }
    }

    /**
     * Documented recall() operation: Search memories using TEMPR 4-way search
     */
    async recall(tenantBankId, query, options = {}) {
        const bankId = await this.ensureBankConfig(tenantBankId);
        try {
            return await this.client.recall(bankId, query, options);
        } catch (error) {
            console.error(`[HindsightService] recall error on bank ${bankId}:`, error.message);
            throw error;
        }
    }

    /**
     * Documented reflect() operation: Auditor disposition reasoning over memories
     */
    async reflect(tenantBankId, query, options = {}) {
        const bankId = await this.ensureBankConfig(tenantBankId);
        try {
            return await this.client.reflect(bankId, query, options);
        } catch (error) {
            console.error(`[HindsightService] reflect error on bank ${bankId}:`, error.message);
            throw error;
        }
    }
}

module.exports = new HindsightService();

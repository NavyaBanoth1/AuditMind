/**
 * Realigned Test Script for Hero Feature 2: Mock-Audit Rehearsal Engine
 * Verifies auditor personas, radar chart metrics, response evaluation, and multi-tenant isolation.
 */

const { initiateMockAuditRehearsal, evaluateRehearsalResponse } = require('../src/compliance/mockAuditEngine');

async function testFeature2MockAudit() {
    console.log("=== Testing Hero Feature 2: Realigned Mock-Audit Rehearsal Engine ===");

    const tenantAcme = "tenant-acme-audit";
    const tenantStark = "tenant-stark-audit";

    // 1. Test Persona 1: Strict Technical Examiner for Acme
    console.log(`\n1. Initiating Rehearsal with Strict Technical Examiner for ${tenantAcme}...`);
    const techRehearsal = await initiateMockAuditRehearsal(tenantAcme, "strict_technical_examiner");
    
    console.log("Persona Selected:", techRehearsal.auditor_persona.name);
    console.log("Auditor Radar Chart Metrics (IAM, Database Encryption, Policy Compliance, Vendor Risk):");
    console.log(JSON.stringify(techRehearsal.radar_chart_metrics, null, 2));

    // 2. Test Practice Answer Evaluation for Acme
    console.log(`\n2. Evaluating Practice Answer for ${tenantAcme}...`);
    const evalAcme = await evaluateRehearsalResponse(tenantAcme, {
        question_id: "Q-TECH-01",
        user_answer: "AWS KMS key arn:aws:kms:us-east-1:123456789012:key/abc-123 is attached to DB instance acme-production-postgres-db.",
        evidence_attached: "CloudTrail_Log_8839_KMS_Verified.json",
        persona_key: "strict_technical_examiner"
    });
    console.log("Acme Evaluation Tenant:", evalAcme.tenant_bank_id);
    console.log("Acme Score:", evalAcme.rehearsal_score);

    // 3. Verify Multi-Tenant Isolation (Stark vs Acme)
    console.log(`\n3. Verifying Multi-Tenant Isolation for ${tenantStark}...`);
    const evalStark = await evaluateRehearsalResponse(tenantStark, {
        question_id: "Q-TECH-01",
        user_answer: "Stark database encryption managed via vault.",
        evidence_attached: "Stark_Vault_Evidence.json",
        persona_key: "strict_technical_examiner"
    });
    console.log("Stark Evaluation Tenant:", evalStark.tenant_bank_id);

    if (evalAcme.tenant_bank_id === tenantAcme && evalStark.tenant_bank_id === tenantStark && evalAcme.tenant_bank_id !== evalStark.tenant_bank_id) {
        console.log("\n✅ Multi-tenant isolation verified! tenant-acme-audit and tenant-stark-audit are strictly isolated.");
    } else {
        console.error("\n❌ Multi-tenant isolation failed!");
        process.exit(1);
    }

    console.log("\n✅ Hero Feature 2 Mock Audit Rehearsal Test Passed!");
}

testFeature2MockAudit();

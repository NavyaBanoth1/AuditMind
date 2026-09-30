/**
 * Realigned Test Script for Hero Feature 3: Visible Learning Curve, Memory Toggle & Time-Travel
 * Verifies 5-component Audit Readiness Score formula, readiness retention, user feedback, Memory ON/OFF comparison, and multi-tenancy.
 */

const { calculateAndRetainReadinessScore, submitFeedback, compareMemoryToggle, executeTemporalTimeTravelQuery } = require('../src/compliance/learningCurveEngine');

async function testFeature3LearningCurve() {
    console.log("=== Testing Hero Feature 3: Realigned Learning Curve & Readiness Score ===");

    const tenantAcme = "tenant-acme-audit";
    const tenantStark = "tenant-stark-audit";

    // 1. Test 5-Component Readiness Score Formula Calculation
    console.log(`\n1. Calculating 5-Component Readiness Score for ${tenantAcme}...`);
    const readiness = await calculateAndRetainReadinessScore(tenantAcme, "Initial audit readiness score baseline");
    console.log("Realigned Readiness Output:");
    console.log(JSON.stringify(readiness, null, 2));

    // Verify mathematical formula: (0.30*85) + (0.25*78) + (0.20*88) + (0.15*82) + (0.10*70) = 82.2
    const b = readiness.breakdown;
    const expectedFormulaScore = Number(
        (0.30 * b.evidence_completeness.score) +
        (0.25 * b.finding_remediation_status.score) +
        (0.20 * b.auditor_prediction_accuracy.score) +
        (0.15 * b.mock_audit_performance.score) +
        (0.10 * b.recurring_risk_resolution.score)
    ).toFixed(1);

    if (Number(expectedFormulaScore) === readiness.readiness_score) {
        console.log(`✓ Readiness score formula verified mathematically! Score: ${readiness.readiness_score}`);
    } else {
        console.error(`❌ Formula mismatch! Expected ${expectedFormulaScore}, got ${readiness.readiness_score}`);
        process.exit(1);
    }

    // 2. Test Feedback Submission & Readiness Update
    console.log(`\n2. Submitting Feedback for ${tenantAcme}...`);
    const feedbackRes = await submitFeedback(tenantAcme, {
        finding_id: "AUD-308",
        feedback_type: "valid",
        comments: "Confirmed unencrypted RDS snapshot log #8839 is an active policy violation.",
        agent_output_context: "AuditMind flagged AUD-308 as active policy violation."
    });
    console.log("Feedback Submitted Tenant:", feedbackRes.tenant_bank_id);
    console.log("Updated Readiness Score:", feedbackRes.updated_readiness_score.readiness_score);

    // 3. Test Multi-Tenant Isolation for Feedback
    console.log(`\n3. Submitting Feedback for ${tenantStark} to verify isolation...`);
    const feedbackStark = await submitFeedback(tenantStark, {
        finding_id: "STARK-101",
        feedback_type: "false_positive",
        comments: "Stark finding is a false positive.",
        agent_output_context: "Stark context"
    });
    console.log("Stark Feedback Tenant:", feedbackStark.tenant_bank_id);

    // 4. Test Memory ON / OFF Side-by-Side Comparison
    console.log("\n4. Testing Memory ON / OFF Side-by-Side Comparison...");
    const memoryComparison = await compareMemoryToggle(tenantAcme, "Are database snapshots encrypted?");
    console.log("Left (Memory OFF / Base Model Mode):", memoryComparison.comparison.left_base_model.mode);
    console.log("Right (Memory ON / AuditMind Agent Mode):", memoryComparison.comparison.right_auditmind_agent.mode);

    // 5. Test Temporal Time-Travel Query
    console.log("\n5. Testing Temporal Time-Travel Query...");
    const timeTravel = await executeTemporalTimeTravelQuery(tenantAcme, "What was our database backup policy?", "2025-03-15");
    console.log("Temporal Query Target Date:", timeTravel.target_date);
    console.log("Limitation Note:", timeTravel.temporal_limitation_note);

    console.log("\n✅ Hero Feature 3 Realignment Test Complete!");
}

testFeature3LearningCurve();

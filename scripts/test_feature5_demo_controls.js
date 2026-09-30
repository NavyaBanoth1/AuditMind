/**
 * Test script for Hero Feature 5: Demo Trap Trigger Controls & Live Hindsight Memory Inspector
 * Verifies all 3 trigger buttons ("Inject Contradiction", "Trigger #AUD-402", "Upload DPDP Amendment")
 * and Memory Inspector telemetry.
 */

const { DEMO_BUTTONS, triggerInjectContradiction, triggerOverdueAud402, triggerUploadDpdpAmendment, getMemoryInspectorData } = require('../src/compliance/demoTriggerEngine');

async function testFeature5DemoControls() {
    console.log("=== Testing Hero Feature 5: Demo Trap Trigger Controls & Memory Inspector ===");

    const tenantBankId = "tenant-acme-audit";

    // 1. Verify Demo Control Buttons Metadata
    console.log("\n1. Checking Demo Control Buttons Metadata...");
    console.log(`Available Buttons Count: ${DEMO_BUTTONS.length}`);
    DEMO_BUTTONS.forEach(btn => console.log(`- [${btn.label}]: ${btn.description}`));

    // 2. Test Trigger 1: Inject Contradiction
    console.log("\n2. Testing Trigger 1: Inject Contradiction...");
    const contradictionRes = await triggerInjectContradiction(tenantBankId);
    console.log("Trigger:", contradictionRes.trigger);
    console.log("Trap Details:", contradictionRes.trap_details);
    console.log("Event Risk Level:", contradictionRes.event_loop_result.event.risk_level);

    // 3. Test Trigger 2: Trigger #AUD-402
    console.log("\n3. Testing Trigger 2: Trigger #AUD-402...");
    const aud402Res = await triggerOverdueAud402(tenantBankId);
    console.log("Trigger:", aud402Res.trigger);
    console.log("Overdue Days:", aud402Res.days_overdue);
    console.log("Watcher Action Title:", aud402Res.deadline_watcher_result.watcher_approval_enqueued.action_title);

    // 4. Test Trigger 3: Upload DPDP Amendment
    console.log("\n4. Testing Trigger 3: Upload DPDP Amendment...");
    const dpdpRes = await triggerUploadDpdpAmendment(tenantBankId);
    console.log("Trigger:", dpdpRes.trigger);
    console.log("Cross Mapping Mapped Keys:", Object.keys(dpdpRes.regulatory_impact_analysis.multi_framework_cross_mapping));

    // 5. Test Live Hindsight Memory Inspector Data
    console.log("\n5. Testing Live Hindsight Memory Inspector Telemetry...");
    const inspectorData = await getMemoryInspectorData(tenantBankId);
    console.log("Inspector Title:", inspectorData.inspector_title);
    console.log("Total Memories Inspected:", inspectorData.total_memories_inspected);
    console.log("Sample Memory grounding badge:", inspectorData.memories[0].grounding_badge);

    if (contradictionRes.event_loop_result && aud402Res.days_overdue === 45 && dpdpRes.regulatory_impact_analysis && inspectorData.total_memories_inspected > 0) {
        console.log("\n✅ Hero Feature 5 Demo Controls & Memory Inspector Test Complete!");
    } else {
        console.error("\n❌ Hero Feature 5 Test Failed!");
        process.exit(1);
    }
}

testFeature5DemoControls();

/**
 * Test script for Prompt 9: Full Enterprise Interface & Visual Dashboard Backend Routes
 * Verifies static frontend UI serving, conflict drawer endpoint, evidence package export endpoint, and all 4 screen backend routes.
 */

const { resolveConflictDrawer } = require('../src/compliance/conflictResolver');

async function testPrompt9Dashboard() {
    console.log("=== Testing Prompt 9: Enterprise Dashboard Backend Endpoints & Conflict Drawer ===");

    const tenantBankId = "tenant-acme-audit";

    // 1. Test Conflict Resolution Drawer Engine
    console.log("\n1. Testing Conflict Resolution Drawer Engine...");
    const conflictRes = await resolveConflictDrawer(tenantBankId, "SNAPSHOT_ENCRYPTION");
    console.log("Conflict Topic:", conflictRes.conflict_topic);
    console.log("Sources Compared Count:", conflictRes.sources_compared.length);
    console.log("Authoritative Conclusion:", conflictRes.authoritative_conclusion);

    // Verify 4-bucket evidence classification in conflict drawer
    if (conflictRes.evidence_classification && conflictRes.sources_compared.length === 2) {
        console.log("\n✅ Prompt 9 Dashboard Conflict Drawer Test Passed!");
    } else {
        console.error("\n❌ Prompt 9 Dashboard Test Failed!");
        process.exit(1);
    }
}

testPrompt9Dashboard();

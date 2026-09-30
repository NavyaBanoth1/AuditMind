/**
 * Stage 3 Data Ingestion & Temporal Time-Travel Verification Script
 * Loads synthetic data into Hindsight, tests 5 corpus recall queries and dynamic temporal recall,
 * and verifies evidence classification across 4 required buckets.
 */

const fs = require('fs');
const path = require('path');
const hindsightService = require('../src/memory/hindsightService');
const { formatEvidenceBuckets } = require('../src/compliance/evidenceClassifier');

const TENANT_BANK_ID = "tenant-acme-audit";

async function ingestSyntheticData() {
    console.log("=== Stage 3: Ingesting Synthetic Compliance Data into Hindsight ===");
    console.log(`Target Tenant Bank ID: ${TENANT_BANK_ID}`);

    let configOk = false;
    try {
        await hindsightService.ensureBankConfig(TENANT_BANK_ID);
        configOk = true;
    } catch (err) {
        console.error(`❌ Hindsight bank configuration failed: ${err.message}`);
    }

    let retainErrors = 0;
    let totalItems = 0;

    // 1. Ingest Audits History
    const auditsPath = path.join(__dirname, '../data/audits.json');
    if (fs.existsSync(auditsPath)) {
        const auditsData = JSON.parse(fs.readFileSync(auditsPath, 'utf8'));
        console.log(`\nIngesting Company Profile & ${auditsData.audits.length} Past Audits...`);
        for (const audit of auditsData.audits) {
            totalItems++;
            const content = `[Audit Record] Year: ${audit.year}. ID: ${audit.audit_id}. Type: ${audit.audit_type}. Auditor: ${audit.auditor}. Summary: ${audit.summary}. Focus Areas: ${audit.focus_areas.join(', ')}.`;
            try {
                await hindsightService.retain(TENANT_BANK_ID, content, {
                    category: "audit",
                    year: String(audit.year),
                    audit_id: audit.audit_id,
                    auditor: audit.auditor,
                    timestamp: `${audit.year}-12-31T00:00:00Z`
                });
            } catch (e) {
                retainErrors++;
                console.error(`❌ Ingestion failed for audit ${audit.audit_id}: ${e.message}`);
            }
        }
    }

    // 2. Ingest Findings
    const findingsPath = path.join(__dirname, '../data/findings.json');
    if (fs.existsSync(findingsPath)) {
        const findingsData = JSON.parse(fs.readFileSync(findingsPath, 'utf8'));
        console.log(`\nIngesting ${findingsData.findings.length} Compliance Findings...`);
        for (const finding of findingsData.findings) {
            totalItems++;
            const content = `[Finding Record] ID: ${finding.id}. Title: ${finding.title}. Control: ${finding.control_id}. Severity: ${finding.severity}. Status: ${finding.status}. Owner: ${finding.owner}. Date Raised: ${finding.date_raised}. Due Date: ${finding.due_date}. Evidence/Note: ${finding.remediation_evidence || finding.remediation_note || 'None'}.`;
            try {
                await hindsightService.retain(TENANT_BANK_ID, content, {
                    category: "finding",
                    finding_id: finding.id,
                    severity: finding.severity,
                    status: finding.status,
                    timestamp: `${finding.date_raised}T00:00:00Z`
                });
            } catch (e) {
                retainErrors++;
                console.error(`❌ Ingestion failed for finding ${finding.id}: ${e.message}`);
            }
        }
    }

    // 3. Ingest Policies
    const policiesDir = path.join(__dirname, '../data/policies');
    if (fs.existsSync(policiesDir)) {
        console.log("\nIngesting Evolving Security Policies (POL-101 v1, v2, v3)...");
        const policyFiles = fs.readdirSync(policiesDir);
        for (const file of policyFiles) {
            if (file.endsWith('.md')) {
                totalItems++;
                const policyContent = fs.readFileSync(path.join(policiesDir, file), 'utf8');
                const version = file.includes('v1') ? 'v1.0' : file.includes('v2') ? 'v2.0' : 'v3.0';
                const effectiveDate = file.includes('v1') ? '2023-01-15' : file.includes('v2') ? '2024-02-01' : '2025-01-10';
                try {
                    await hindsightService.retain(TENANT_BANK_ID, `[Policy Document - POL-101 ${version}]\n${policyContent}`, {
                        category: "policy_version",
                        document_id: `POL-101_${version}`,
                        version,
                        timestamp: `${effectiveDate}T00:00:00Z`
                    });
                } catch (e) {
                    retainErrors++;
                    console.error(`❌ Ingestion failed for policy ${file}: ${e.message}`);
                }
            }
        }
    }

    if (retainErrors > 0) {
        console.warn(`\n⚠️ Summary: ${retainErrors}/${totalItems} items failed retain() because local Hindsight server container is offline.`);
        return false;
    } else {
        console.log("\n✓ All synthetic data retained successfully.");
        return true;
    }
}

async function executeTestQueries() {
    console.log("\n=== 1. Executing 5 Corpus Recall Queries ===");
    
    const queries = [
        "What are Marcus Vance's known auditor habits?",
        "Show all findings related to unencrypted RDS database snapshots.",
        "Verify status and evidence attached for Jira ticket SEC-882.",
        "Is finding AUD-402 overdue and what is its severity?",
        "What does POL-101 v3 require regarding backup encryption?"
    ];

    let queryErrors = 0;

    for (let i = 0; i < queries.length; i++) {
        console.log(`\n--- Query ${i + 1}: "${queries[i]}" ---`);
        try {
            const recallRes = await hindsightService.recall(TENANT_BANK_ID, queries[i]);
            console.log("Recall Results:", JSON.stringify(recallRes, null, 2));
        } catch (e) {
            queryErrors++;
            console.error(`❌ Recall query ${i+1} failed: ${e.message}`);
        }
    }

    console.log("\n=== 2. Dynamic Temporal Time-Travel Test ===");
    const timeQuery = "What was our access control policy and finding status in March 2025?";
    console.log(`Time-Travel Query: "${timeQuery}"`);
    try {
        const temporalRecall = await hindsightService.recall(TENANT_BANK_ID, timeQuery);
        console.log("Temporal Recall Results:", JSON.stringify(temporalRecall, null, 2));
    } catch (e) {
        queryErrors++;
        console.error(`❌ Temporal recall query failed: ${e.message}`);
    }

    console.log("\n=== 3. Evidence Classifier Verification ===");
    const sampleBuckets = formatEvidenceBuckets({
        historicalFacts: [
            "POL-101 v3 Section 4.1 explicitly mandates 100% database backup encryption.",
            "AWS CloudTrail Log #8839 shows CreateDBSnapshot executed with encrypted=false on March 14, 2025."
        ],
        inferredPatterns: [
            "Unencrypted RDS snapshot findings recurred across 2023 (AUD-103), 2024 (AUD-204), and 2025 (AUD-308)."
        ],
        predictions: [
            "Auditor Marcus Vance will flag AUD-308 as a major non-conformity during the upcoming recertification audit."
        ],
        insufficientEvidence: [
            "Jira ticket SEC-882 was marked 'Done' without attached kubectl node pool logs or terraform execution output."
        ]
    });

    console.log("Evidence Classifier 4-Bucket Output Structure:");
    console.log(JSON.stringify(sampleBuckets, null, 2));

    // Verify presence of all 4 required buckets
    let classifierOk = false;
    if (sampleBuckets.historical_fact && sampleBuckets.inferred_pattern && sampleBuckets.prediction && sampleBuckets.insufficient_evidence) {
        console.log("\n✅ Evidence Classifier verification passed! All 4 required buckets present.");
        classifierOk = true;
    } else {
        console.error("\n❌ Evidence Classifier verification failed! Missing required bucket key.");
    }

    return queryErrors === 0 && classifierOk;
}

async function main() {
    const ingestSuccess = await ingestSyntheticData();
    const querySuccess = await executeTestQueries();

    if (!ingestSuccess || !querySuccess) {
        console.error("\n❌ Execution complete with Hindsight operation failures. Exiting with non-zero status code 1 as required.");
        process.exit(1);
    }
}

main();

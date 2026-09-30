# AuditMind — Autonomous Enterprise Compliance & Audit Memory Agent

**AuditMind** is an autonomous compliance and audit agent built for organizations preparing for **ISO 27001**, **SOC 2 Type II**, and regional regulations (such as India's **DPDP Act**). Powered by **Vectorize's Hindsight** long-term vector memory engine, AuditMind functions as an uncompromising lead enterprise compliance auditor that continuously retains policy baselines, evaluates live operational telemetry, detects recurring compliance gaps, rehearses mock audits, and enqueues high-risk actions for human-in-the-loop approval.

---

## 🛠️ Quick Start & Local Setup

### Prerequisites
- Node.js (v18+)
- Python 3.x (for dataset validation suite)
- Running Hindsight Memory Instance (or local container at `http://localhost:8888`)

### 1. Installation
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure your environment variables are configured:
```env
HINDSIGHT_URL=http://localhost:8888
HINDSIGHT_API_KEY=your_hindsight_api_key
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-120b
PORT=3000
DEFAULT_TENANT_BANK_ID=tenant-acme-audit
```

### 3. Launching the Server & Single-Page Dashboard
```bash
npm run dev
# OR
npm start
```
Open **http://localhost:3000** in your browser to interact with the enterprise dark-mode compliance dashboard.

---

## 🏗️ System Architecture Diagram

```
 +-----------------------------------------------------------------------------------+
 |                             AuditMind Web Dashboard                                |
 |      (Mission Control | Regulatory Impact | Mock Audit | Memory Inspector)       |
 +----------------------------------------+------------------------------------------+
                                          |
                                          v  REST API
 +-----------------------------------------------------------------------------------+
 |                             Express Node.js Server                                |
 |  (/api/ingest | /api/webhooks/ingress | /api/event-feed | /api/export/package)   |
 +----+-----------------------+------------------------+------------------------+----+
      |                       |                        |                        |
      v                       v                        v                        v
+-------------+     +-------------------+     +------------------+     +------------------+
| Regulatory  |     |  Mock Audit       |     | Learning Curve   |     | Autonomous Event |
| Impact      |     |  Rehearsal        |     | & Readiness      |     | Loop Engine      |
| Engine      |     |  Engine           |     | Engine (5-Comp)  |     | & Approvals      |
+-------------+     +-------------------+     +------------------+     +------------------+
      |                       |                        |                        |
      +-----------------------+------------+-----------+------------------------+
                                           |
                                           v
 +-----------------------------------------------------------------------------------+
 |                        @vectorize-io/hindsight-client                             |
 |                     (Dynamic Multi-Tenant bank_id Scoping)                         |
 +-----------------------------------------+-----------------------------------------+
                                           |
                                           v
 +-----------------------------------------------------------------------------------+
 |                    Hindsight Vector Memory Engine (Vectorize)                     |
 |              [ retain()  |  recall() (TEMPR)  |  reflect() ]                     |
 +-----------------------------------------------------------------------------------+
```

---

## 🏢 Multi-Tenant Bank Scoping Model (`bank_id`)

AuditMind enforces strict multi-tenant isolation across all memory operations. Memory operations are strictly scoped by dynamic tenant IDs:
- **`tenant-acme-audit`**: ACME Corp compliance memory bank.
- **`tenant-stark-audit`**: Stark Industries compliance memory bank.

Every call to `hindsightService.retain()`, `hindsightService.recall()`, and `hindsightService.reflect()` receives the active tenant `bank_id`. Memories, findings, feedback, events, and audit readiness scores belonging to one tenant are **never** returned or leaked to another tenant.

---

## 🧠 Hindsight Long-Term Memory Integration

AuditMind leverages the official `@vectorize-io/hindsight-client` Node.js SDK for all long-term memory operations:

### 1. `retain(bankId, content, metadata)`
Ingests policies (`POL-101` v1/v2/v3), CloudTrail logs (`#8839`), Jira tickets (`SEC-882`), autonomous event logs, user feedback (`Valid` vs `False Positive`), and readiness score snapshots into the specified tenant memory bank.
```javascript
await hindsightService.retain("tenant-acme-audit", "POL-101 v3 Section 4.1 mandates 100% database snapshot encryption.", {
    category: "policy_version",
    tenant_bank_id: "tenant-acme-audit"
});
```

### 2. `recall(bankId, query)`
Executes semantic and temporal search across the tenant bank using natural-language TEMPR queries to retrieve grounded historical facts and past finding patterns.
```javascript
const memories = await hindsightService.recall("tenant-acme-audit", "RDS snapshot encryption policy enforcement as of March 2025");
```

### 3. `reflect(bankId, query)`
Invokes Hindsight's dispositional reasoning layer to analyze auditor reasoning, compliance gaps, and non-conformity risks based on the tenant's retained memory corpus.
```javascript
const reasoning = await hindsightService.reflect("tenant-acme-audit", "Evaluate auditor strictness and compliance gap for unencrypted snapshots");
```

---

## 🎯 Planted Compliance Traps

AuditMind is benchmarked against 4 realistic enterprise compliance traps:
1. **Recurring Findings Trap:** Unencrypted RDS manual snapshots flagged in 2023 (`AUD-103`), 2024 (`AUD-204`), and 2025 (`AUD-308`).
2. **Fake Fix Trap:** Jira ticket `SEC-882` (remediating `AUD-305`) marked "Done" by an engineer with zero attached execution logs or terraform plans.
3. **Overdue Item Trap:** Critical IAM privilege finding `#AUD-402` overdue past its 30-day SLA by 45+ days.
4. **Contradiction Trap:** Mandatory policy `POL-101 v3` requiring 100% snapshot encryption vs AWS CloudTrail Log `#8839` recording `CreateDBSnapshot` executed with `encrypted=false`.

---

## 🧪 Verification & Testing Suites

To execute the data validation suite:
```bash
python3 scripts/validate_data.py
```

To execute the 20-test automated verification suite (covering all hero features, planted traps, multi-tenant isolation, and resilience):
```bash
node scripts/test_prompt10_suite.js
```

To run individual feature test scripts:
```bash
node scripts/test_prompt9_dashboard.js
node scripts/test_hindsight.js
node scripts/test_feature1_regulatory.js
node scripts/test_feature2_mockaudit.js
node scripts/test_feature3_learning.js
node scripts/test_feature4_eventloop.js
node scripts/test_feature5_demo_controls.js
```

---

## 🔌 OpenClaw Plugin Integration

AuditMind provides a modular OpenClaw plugin interface at `/plugin/openclaw/openclaw.json` mapping to `/plugin/openclaw/adapter.js`.

### Capabilities:
- `memory_retain`
- `memory_recall`
- `memory_reflect`
- `event_ingress`
- `multi_framework_mapping`

### Exported Actions:
- `handleIngressEvent`: Normalizes raw webhooks (AWS CloudTrail, Jira, GitHub) into Hindsight long-term memory.
- `queryComplianceMemory`: Queries Hindsight vector memory and returns multi-framework cross-mappings.

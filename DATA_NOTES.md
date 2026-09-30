# AuditMind - Synthetic Dataset & Planted Traps Guide (`DATA_NOTES.md`)

This repository contains synthetic compliance history and planted demonstration traps for **Acme Cloud Technologies** (a fictional SaaS company preparing for ISO 27001:2022 and SOC 2 Type II audits).

> **DISCLAIMER:** All regulations (including the DPDP Act amendment), company records, logs, and policies are synthetic materials created solely for demonstration purposes. They do not constitute legal or regulatory advice.

---

## 📁 Dataset Directory Overview

- **`data/audits.json`**: 3 years of past audits (2023, 2024, 2025) conducted by auditor **Marcus Vance** (Apex Cyber Assurance Group), capturing his distinct habits (checking access reviews, vendor risk, and unencrypted database snapshots).
- **`data/findings.json`**: 31 compliance findings across ISO 27001 and SOC 2 controls with owner, dates, severity, status, and evidence pointers.
- **`data/policies/`**:
  - `POL-101_v1.md`: Baseline policy (2023) where staging snapshots were exempt from mandatory encryption.
  - `POL-101_v2.md`: Revised policy (2024) requiring KMS encryption for manual production RDS snapshots.
  - `POL-101_v3.md`: Current policy (2025) establishing **100% mandatory encryption** across all accounts/environments without exception.
- **`data/regulations/DPDP_Retention_Amendment.json`**: Fictional DPDP Act Section 8 Clause 7 amendment enforcing 180-day retention limits on offboarded customer data.
- **`data/logs/aws_cloudtrail_8839.json`**: AWS CloudTrail log event `#8839` recording an unencrypted RDS manual snapshot creation (`acme-prod-db-manual-snap-20250314`).
- **`data/jira/tickets.json`**: Jira tickets including ticket `SEC-882` (marked "Done" with no evidence).

---

## 🎯 Planted Demo Traps & How to Trigger Them

### Trap 1: Recurring Finding (Unencrypted RDS Snapshots)
- **What it is:** Manual unencrypted RDS snapshots were flagged in 2023 (`AUD-103`) and 2024 (`AUD-204`), and recurred in 2025 (`AUD-308`).
- **Why it matters:** Demonstrates that previous fixes were superficial manual cleanups rather than systemic Terraform/AWS Config guardrails.
- **How to trigger in AuditMind:**
  - *User Query:* `"Show me recurring findings across past audits with Marcus Vance."`
  - *Expected Agent Response:* Identifies `AUD-103`, `AUD-204`, and `AUD-308` as a recurring pattern under ISO 27001 A.8.24 / SOC 2 CC6.6 due to lack of automated KMS enforcement.

### Trap 2: Fake Fix (Jira SEC-882 / Finding AUD-305)
- **What it is:** Finding `AUD-305` (Kubernetes EOL node OS) is linked to Jira ticket `SEC-882`, which was marked as `Done` by engineer Alex Rivera with a comment `"Completed node pool upgrade in production."`, but has **zero attachments or evidence logs**.
- **Why it matters:** Highlights the risk of closing compliance findings based on self-reported developer status without verification proof.
- **How to trigger in AuditMind:**
  - *User Query:* `"Verify if finding AUD-305 is properly remediated with proof."`
  - *Expected Agent Response:* Flags `SEC-882` as a "Fake Fix / Insufficient Evidence" because status is marked `Done` without attached deployment logs, terraform outputs, or cluster state files.

### Trap 3: Overdue High-Risk Item (AUD-402)
- **What it is:** High-severity finding `AUD-402` ("Privileged IAM Admin Access Granted Without Time-Bound Expiry") had a deadline of **February 10, 2025**, and is currently **45+ days overdue**.
- **Why it matters:** Critical audit risk under SOC 2 CC6.2 and ISO 27001 A.5.15 that requires immediate escalation.
- **How to trigger in AuditMind:**
  - *User Query:* `"Are there any high-risk overdue findings past their deadline?"`
  - *Expected Agent Response:* Highlights `AUD-402` owned by Alex Rivera, citing date raised (2025-01-10), due date (2025-02-10), and overdue duration.

### Trap 4: Direct Contradiction (Policy POL-101 v3 vs CloudTrail Log #8839)
- **What it is:** Security Policy `POL-101 v3` Section 4.1 explicitly mandates: *"All database instances, automated backups, and manual snapshots... MUST BE ENCRYPTED at rest... No Exceptions."* However, AWS CloudTrail log `#8839` records user `alex.rivera` executing `CreateDBSnapshot` for `acme-prod-db-manual-snap-20250314` with `"encrypted": false`.
- **Why it matters:** Demonstrates a direct conflict between written policy and real-time AWS infrastructure telemetry.
- **How to trigger in AuditMind:**
  - *User Query:* `"Audit AWS CloudTrail log 8839 against our latest backup policy."`
  - *Expected Agent Response:* Cites historical policy fact (`POL-101 v3 Section 4.1`) and technical fact (Log #8839 `"encrypted": false`), declaring a policy violation and compliance contradiction.

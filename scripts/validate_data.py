import json
import os
import sys

def validate():
    print("=== Validating AuditMind Synthetic Datasets ===")
    
    # 1. Check file existence
    required_files = [
        "data/audits.json",
        "data/findings.json",
        "data/policies/POL-101_v1.md",
        "data/policies/POL-101_v2.md",
        "data/policies/POL-101_v3.md",
        "data/regulations/DPDP_Retention_Amendment.json",
        "data/logs/aws_cloudtrail_8839.json",
        "data/jira/tickets.json",
        "DATA_NOTES.md"
    ]
    
    for filepath in required_files:
        if not os.path.exists(filepath):
            print(f"❌ Missing file: {filepath}")
            sys.exit(1)
        print(f"✓ Found: {filepath}")

    # 2. Validate findings count (>= 30)
    with open("data/findings.json", "r") as f:
        findings_data = json.load(f)
        findings = findings_data.get("findings", [])
        print(f"✓ Findings count: {len(findings)} (Requirement: >= 30)")
        if len(findings) < 30:
            print("❌ Findings count is less than 30!")
            sys.exit(1)

    # 3. Validate planted traps presence
    # Trap 1: Recurring finding
    recurring = [f for f in findings if f.get("is_recurring_trap_instance_1") or f.get("is_recurring_trap_instance_2") or f.get("id") == "AUD-308"]
    print(f"✓ Trap 1 (Recurring findings): Found {len(recurring)} instances across 3 years.")
    if len(recurring) < 3:
        print("❌ Trap 1 failed verification!")
        sys.exit(1)

    # Trap 2: Fake fix
    fake_fix = [f for f in findings if f.get("fake_fix_trap")]
    print(f"✓ Trap 2 (Fake fix): Found finding {fake_fix[0]['id']} with Jira ticket {fake_fix[0]['jira_ticket']}.")
    if not fake_fix:
        print("❌ Trap 2 failed verification!")
        sys.exit(1)

    # Trap 3: Overdue high-risk item (#AUD-402)
    overdue = [f for f in findings if f.get("id") == "AUD-402" and f.get("status") == "Overdue (Trap)"]
    print(f"✓ Trap 3 (Overdue AUD-402): Found overdue finding {overdue[0]['id']} ({overdue[0]['days_overdue']} days overdue).")
    if not overdue:
        print("❌ Trap 3 failed verification!")
        sys.exit(1)

    # Trap 4: Direct Contradiction
    contradiction = [f for f in findings if f.get("id") == "AUD-308" and "Contradiction Trap" in f.get("status", "")]
    print(f"✓ Trap 4 (Contradiction): Found {contradiction[0]['id']} referencing log {contradiction[0]['contradiction_log_id']}.")
    if not contradiction:
        print("❌ Trap 4 failed verification!")
        sys.exit(1)

    print("\n✅ All data validations and planted trap verification checks passed successfully!")

if __name__ == "__main__":
    validate()

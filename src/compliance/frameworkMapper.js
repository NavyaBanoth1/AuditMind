/**
 * Compliance Multi-Framework Mapping Engine
 * Supports cross-mapping across:
 * 1. ISO/IEC 27001:2022
 * 2. SOC 2 Type II (Trust Services Criteria)
 * 3. GDPR Article 32 (Security of Processing)
 * 4. India Digital Personal Data Protection (DPDP) Act
 * 5. HIPAA Security Rule (164.312 Technical Safeguards)
 * 6. PCI-DSS v4.0 (Requirement 3 & 10)
 */

const FRAMEWORK_CROSS_MAP = {
    "DATA_ENCRYPTION_REST": {
        "ISO_27001": "A.8.24 (Use of Cryptography)",
        "SOC_2": "CC6.6 (Encryption & Boundaries)",
        "GDPR": "Article 32(1)(a) (Pseudonymisation and Encryption)",
        "DPDP_ACT": "Section 8(4) (Data Security Safeguards)",
        "HIPAA": "164.312(a)(2)(iv) (Encryption and Decryption)",
        "PCI_DSS": "Requirement 3.4 (Protect Stored Cardholder Data)"
    },
    "PRIVILEGED_ACCESS_REVIEW": {
        "ISO_27001": "A.5.15 (Access Control) & A.8.2 (Privileged Rights)",
        "SOC_2": "CC6.1 (Logical Access) & CC6.2 (User Credentials)",
        "GDPR": "Article 32(1)(b) (Confidentiality and Access Control)",
        "DPDP_ACT": "Section 8(5) (Authorized Access Guardrails)",
        "HIPAA": "164.312(a)(1) (Access Control - Unique User ID)",
        "PCI_DSS": "Requirement 7.1 (Restrict Access to Cardholder Data)"
    },
    "DATA_RETENTION_DELETION": {
        "ISO_27001": "A.8.10 (Information Deletion)",
        "SOC_2": "CC6.5 (Data Disposal) & P6.1 (Privacy Retention)",
        "GDPR": "Article 17 (Right to Erasure) & Article 5(1)(e)",
        "DPDP_ACT": "Section 8(7) (Erasure of Personal Data / 180-Day Rule)",
        "HIPAA": "164.316(b)(2)(i) (Retention and Destruction)",
        "PCI_DSS": "Requirement 3.1 (Keep Cardholder Data Storage to Minimum)"
    },
    "AUDIT_LOGGING_MONITORING": {
        "ISO_27001": "A.8.15 (Logging) & A.8.16 (Monitoring)",
        "SOC_2": "CC7.2 (Infrastructure & Security Monitoring)",
        "GDPR": "Article 32(1)(d) (Regular Testing and Evaluation)",
        "DPDP_ACT": "Section 8(6) (Data Breach Notification & Log Audit)",
        "HIPAA": "164.312(b) (Audit Controls)",
        "PCI_DSS": "Requirement 10.1 (Log and Monitor All System Access)"
    }
};

function mapControlAcrossFrameworks(topicOrControlKey) {
    const key = (topicOrControlKey || '').toUpperCase().trim();
    if (FRAMEWORK_CROSS_MAP[key]) {
        return FRAMEWORK_CROSS_MAP[key];
    }

    // Default cross-mapping fallback for general technical findings
    if (key.includes('ENCRYPT') || key.includes('SNAPSHOT') || key.includes('SNAPSHOTS') || key.includes('BACKUP')) {
        return FRAMEWORK_CROSS_MAP["DATA_ENCRYPTION_REST"];
    }
    if (key.includes('ACCESS') || key.includes('IAM') || key.includes('PRIVILEGE')) {
        return FRAMEWORK_CROSS_MAP["PRIVILEGED_ACCESS_REVIEW"];
    }
    if (key.includes('RETENTION') || key.includes('ERASURE') || key.includes('DELETE')) {
        return FRAMEWORK_CROSS_MAP["DATA_RETENTION_DELETION"];
    }

    return FRAMEWORK_CROSS_MAP["AUDIT_LOGGING_MONITORING"];
}

module.exports = {
    FRAMEWORK_CROSS_MAP,
    mapControlAcrossFrameworks
};

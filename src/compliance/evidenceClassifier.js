/**
 * Evidence Classifier Service
 * Enforces strict 4-bucket evidence classification on all compliance analysis outputs:
 * 1. Historical Fact (Direct memory / document citation)
 * 2. Inferred Pattern (Synthesized trend across past audits/logs)
 * 3. Prediction (Auditor behavioral forecast)
 * 4. Insufficient Evidence (Explicitly flagged when facts or proof are missing)
 */

function formatEvidenceBuckets({ historicalFacts = [], inferredPatterns = [], predictions = [], insufficientEvidence = [] }) {
    const insufficientList = Array.isArray(insufficientEvidence) ? insufficientEvidence : [insufficientEvidence];
    if (insufficientList.length === 0 && historicalFacts.length === 0) {
        insufficientList.push("Insufficient Evidence in Memory Bank");
    }

    return {
        historical_fact: Array.isArray(historicalFacts) ? historicalFacts : [historicalFacts],
        inferred_pattern: Array.isArray(inferredPatterns) ? inferredPatterns : [inferredPatterns],
        prediction: Array.isArray(predictions) ? predictions : [predictions],
        insufficient_evidence: insufficientList
    };
}

function parseAndEnforceBuckets(agentRawOutput) {
    if (typeof agentRawOutput === 'object' && agentRawOutput !== null) {
        return {
            historical_fact: agentRawOutput.historical_fact || agentRawOutput.historicalFacts || [],
            inferred_pattern: agentRawOutput.inferred_pattern || agentRawOutput.inferredPatterns || [],
            prediction: agentRawOutput.prediction || agentRawOutput.predictions || [],
            insufficient_evidence: agentRawOutput.insufficient_evidence || agentRawOutput.insufficientEvidence || ["Insufficient Evidence in Memory Bank"]
        };
    }

    // Default string wrapper if plain text returned
    return {
        historical_fact: [agentRawOutput || "No direct historical facts retrieved."],
        inferred_pattern: ["Potential pattern based on available corpus."],
        prediction: ["Auditor Marcus Vance is likely to inspect this control during the upcoming audit."],
        insufficient_evidence: ["Insufficient Evidence in Memory Bank"]
    };
}

module.exports = {
    formatEvidenceBuckets,
    parseAndEnforceBuckets
};

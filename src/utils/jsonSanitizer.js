/**
 * JSON Sanitation Utility for AuditMind Backend Handlers
 * Strips markdown code block wrappers (e.g. ```json ... ```) to prevent JSON.parse() syntax errors.
 */

function cleanJsonString(rawInput) {
    if (typeof rawInput !== 'string') {
        return rawInput;
    }

    let cleaned = rawInput.trim();

    // Strip markdown codeblock wrappers if present
    if (cleaned.startsWith('```')) {
        // Remove leading ```json or ```
        cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
        // Remove trailing ```
        cleaned = cleaned.replace(/\s*```$/, '');
    }

    return cleaned.trim();
}

function cleanAndParseJson(rawInput, fallback = null) {
    if (typeof rawInput === 'object' && rawInput !== null) {
        return rawInput;
    }

    try {
        const cleanedStr = cleanJsonString(rawInput);
        return JSON.parse(cleanedStr);
    } catch (error) {
        console.error('JSON Sanitation Parse Error:', error.message, 'Raw input:', rawInput);
        return fallback;
    }
}

module.exports = {
    cleanJsonString,
    cleanAndParseJson
};

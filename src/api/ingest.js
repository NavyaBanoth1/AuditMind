/**
 * Live Ingestion Dropzone Route (/api/ingest)
 * Backend route supporting text/JSON payload and document ingestion (.pdf, .txt, .json, .log)
 * that immediately triggers retain() into Hindsight for the active tenant_bank_id.
 */

const express = require('express');
const router = express.Router();
const hindsightService = require('../memory/hindsightService');
const { cleanAndParseJson } = require('../utils/jsonSanitizer');

router.post('/ingest', async (req, res) => {
    try {
        const body = cleanAndParseJson(req.body, req.body);
        const { tenant_bank_id, document_name, file_type, content, metadata } = body || {};

        if (!content || (typeof content !== 'string' && typeof content !== 'object')) {
            return res.status(400).json({
                error: "Invalid ingestion request. Mandatory field: content."
            });
        }

        const targetBankId = hindsightService.resolveBankId(tenant_bank_id);
        const docName = document_name || `Uploaded_Doc_${Date.now()}`;
        const fileExt = file_type || 'txt';
        
        const rawText = typeof content === 'object' ? JSON.stringify(content, null, 2) : content;
        const formattedContent = `[Ingested Document: ${docName}.${fileExt}]\n${rawText}`;

        const ingestionMetadata = {
            category: "user_upload",
            document_name: docName,
            file_type: fileExt,
            ingested_at: new Date().toISOString(),
            ...(metadata || {})
        };

        let hindsightResult = null;
        try {
            hindsightResult = await hindsightService.retain(targetBankId, formattedContent, ingestionMetadata);
        } catch (hErr) {
            console.warn(`[Ingest Route] Hindsight server offline/unreachable for bank ${targetBankId}: ${hErr.message}`);
        }

        return res.status(200).json({
            success: true,
            tenant_bank_id: targetBankId,
            document_name: docName,
            file_type: fileExt,
            bytes_processed: Buffer.byteLength(rawText, 'utf8'),
            hindsight_retained: !!hindsightResult,
            message: `Document ${docName}.${fileExt} ingested into Hindsight tenant bank ${targetBankId}.`
        });

    } catch (error) {
        console.error('[Ingest Route Error]:', error);
        return res.status(500).json({
            error: "Document ingestion failed.",
            details: error.message
        });
    }
});

module.exports = router;

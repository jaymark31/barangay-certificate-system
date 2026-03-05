const PDFDocument = require('pdfkit');
const {
    AlignmentType,
    Document,
    HeadingLevel,
    Packer,
    Paragraph,
    Table,
    TableCell,
    TableRow,
    TextRun,
    WidthType,
} = require('docx');
const mammoth = require('mammoth');
const ApiError = require('../utils/errors');
const certificateService = require('../services/certificateService');

exports.getByRequestId = async (req, res, next) => {
    try {
        const { requestId } = req.params;
        const cert = await certificateService.getCertificateByRequestId(requestId);
        if (!cert) return next(new ApiError(404, 'Request not found'));
        res.status(200).json({ status: 'success', data: cert });
    } catch (error) {
        next(error);
    }
};

exports.updateByRequestId = async (req, res, next) => {
    try {
        const { requestId } = req.params;
        const { content } = req.body;
        if (!content || !String(content).trim()) {
            return next(new ApiError(400, 'Certificate content is required'));
        }
        const saved = await certificateService.upsertCertificateContent({
            requestId,
            content: String(content),
            userId: req.user.id,
        });
        res.status(200).json({ status: 'success', data: { certificate: saved } });
    } catch (error) {
        next(error);
    }
};

exports.downloadPdfByRequestId = async (req, res, next) => {
    try {
        const { requestId } = req.params;
        const cert = await certificateService.getCertificateByRequestId(requestId);
        if (!cert) return next(new ApiError(404, 'Request not found'));

        const content = cert.certificate.content || '';
        const doc = new PDFDocument({ size: 'A4', margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="certificate-${requestId}.pdf"`);

        doc.pipe(res);

        doc.fontSize(16).text('Barangay Certificate', { align: 'center' });
        doc.moveDown(1);

        doc.fontSize(11).text(content, { align: 'left' });

        doc.end();
    } catch (error) {
        next(error);
    }
};

exports.downloadDocxByRequestId = async (req, res, next) => {
    try {
        const { requestId } = req.params;
        const cert = await certificateService.getCertificateByRequestId(requestId);
        if (!cert) return next(new ApiError(404, 'Request not found'));

        const ctx = await certificateService.getRequestContext(requestId);
        if (!ctx) return next(new ApiError(404, 'Request not found'));

        const content = cert.certificate.content || '';
        const lines = String(content).split(/\r?\n/);

        const barangayName = process.env.BARANGAY_NAME || 'BARANGAY __________';
        const municipalityName = process.env.MUNICIPALITY_NAME || 'MUNICIPALITY / CITY __________';
        const provinceName = process.env.PROVINCE_NAME || 'PROVINCE __________';

        const formData = (() => {
            const fd = ctx.formData;
            if (!fd) return {};
            if (typeof fd === 'string') {
                try {
                    return JSON.parse(fd) || {};
                } catch {
                    return {};
                }
            }
            return fd || {};
        })();

        const detailsRows = [
            ['Request ID', requestId],
            ['Resident Name', ctx.residentFullName || ''],
            ['Resident Email', ctx.residentEmail || ''],
            ['Certificate Type', ctx.certificateTypeName || ''],
            ['Date Requested', ctx.createdAt ? new Date(ctx.createdAt).toISOString().split('T')[0] : ''],
            ...Object.entries(formData).map(([k, v]) => [k, v === null || v === undefined ? '' : String(v)]),
        ].filter(([, v]) => String(v).trim());

        const detailsTable = new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: detailsRows.map(
                ([label, value]) =>
                    new TableRow({
                        children: [
                            new TableCell({
                                width: { size: 35, type: WidthType.PERCENTAGE },
                                children: [
                                    new Paragraph({
                                        children: [new TextRun({ text: label, bold: true })],
                                    }),
                                ],
                            }),
                            new TableCell({
                                width: { size: 65, type: WidthType.PERCENTAGE },
                                children: [new Paragraph({ children: [new TextRun({ text: value })] })],
                            }),
                        ],
                    })
            ),
        });

        const doc = new Document({
            sections: [
                {
                    properties: {},
                    children: [
                        // Header
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [new TextRun({ text: 'REPUBLIC OF THE PHILIPPINES', bold: true })],
                        }),
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [new TextRun({ text: provinceName })],
                        }),
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [new TextRun({ text: municipalityName })],
                        }),
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [new TextRun({ text: barangayName, bold: true })],
                        }),
                        new Paragraph({ text: '' }),

                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [new TextRun({ text: 'OFFICE OF THE PUNONG BARANGAY', italics: true })],
                        }),
                        new Paragraph({ text: '' }),

                        // Title
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            heading: HeadingLevel.HEADING_1,
                            children: [
                                new TextRun({
                                    text: (ctx.certificateTypeName || 'BARANGAY CERTIFICATE').toUpperCase(),
                                    bold: true,
                                }),
                            ],
                        }),
                        new Paragraph({ text: '' }),

                        // Details table (inputs)
                        new Paragraph({
                            heading: HeadingLevel.HEADING_2,
                            children: [new TextRun({ text: 'Request Details', bold: true })],
                        }),
                        detailsTable,
                        new Paragraph({ text: '' }),

                        // Editable body
                        new Paragraph({
                            heading: HeadingLevel.HEADING_2,
                            children: [new TextRun({ text: 'Certificate Content (Editable)', bold: true })],
                        }),
                        ...lines.map((t) =>
                            new Paragraph({
                                children: [new TextRun({ text: t || ' ' })],
                            })
                        ),
                        new Paragraph({ text: '' }),

                        // Signature blocks
                        new Paragraph({
                            children: [new TextRun({ text: 'Issued by:', bold: true })],
                        }),
                        new Paragraph({ text: '' }),
                        new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            children: [new TextRun({ text: '______________________________', bold: true })],
                        }),
                        new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            children: [new TextRun({ text: 'Punong Barangay / Authorized Signatory' })],
                        }),
                        new Paragraph({ text: '' }),
                        new Paragraph({
                            children: [new TextRun({ text: 'Prepared by:', bold: true })],
                        }),
                        new Paragraph({ text: '' }),
                        new Paragraph({
                            children: [new TextRun({ text: '______________________________' })],
                        }),
                        new Paragraph({
                            children: [new TextRun({ text: 'Barangay Secretary / Staff' })],
                        }),
                    ],
                },
            ],
        });

        const buffer = await Packer.toBuffer(doc);
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        );
        res.setHeader('Content-Disposition', `attachment; filename="certificate-${requestId}.docx"`);
        res.status(200).send(buffer);
    } catch (error) {
        next(error);
    }
};

exports.uploadDocxByRequestId = async (req, res, next) => {
    try {
        const { requestId } = req.params;
        if (!req.file) return next(new ApiError(400, 'DOCX file is required'));

        const result = await mammoth.extractRawText({ buffer: req.file.buffer });
        const text = (result.value || '').trim();
        if (!text) return next(new ApiError(400, 'Could not read any text from DOCX'));

        const saved = await certificateService.upsertCertificateContent({
            requestId,
            content: text,
            userId: req.user.id,
        });

        res.status(200).json({ status: 'success', message: 'Certificate updated from DOCX', data: { certificate: saved } });
    } catch (error) {
        next(error);
    }
};


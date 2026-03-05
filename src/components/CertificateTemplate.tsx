import React from 'react';

export interface CertificateTemplateProps {
    templateContent: string;
    data?: Record<string, string>;
}

export function replacePlaceholders(template: string, data: Record<string, string> = {}) {
    let content = template;
    // Default fallbacks to show layout if data is incomplete
    const fallback = {
        full_name: 'John Doe',
        address: '123 Main St, Barangay X',
        purpose: 'Employment',
        date_issued: new Date().toISOString().split('T')[0],
        barangay_name: 'Sample Barangay',
        captain_name: 'Hon. Jane Smith',
        certificate_title: 'CERTIFICATE',
        province: 'Sample Province',
        municipality: 'Sample Municipality',
    };

    const placeholders = ['full_name', 'address', 'purpose', 'date_issued', 'barangay_name', 'captain_name', 'certificate_title', 'province', 'municipality'];

    placeholders.forEach((key) => {
        const value = data[key] || fallback[key as keyof typeof fallback];
        const regex = new RegExp(`{{${key}}}`, 'g');
        content = content.replace(regex, value);
    });

    return content;
}

export const CertificateTemplate: React.FC<CertificateTemplateProps> = ({ templateContent, data = {} }) => {
    const processedHTML = replacePlaceholders(templateContent || `<div class="certificate"><h1>No Template Defined</h1></div>`, data);

    return (
        <div
            className="certificate-print-area max-w-[210mm] min-h-[297mm] mx-auto bg-white text-black p-8 relative rounded shadow print:shadow-none print:p-0 print:m-0"
            dangerouslySetInnerHTML={{ __html: processedHTML }}
        />
    );
};

import type { CertificateRequest, RequestStatus } from '@/services/mockData';

function formatDate(d: string | Date | null | undefined): string {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toISOString().split('T')[0];
}

export function mapApiRequestToCertRequest(r: {
  id: string;
  resident_id?: string;
  residentFullName?: string;
  residentEmail?: string;
  certificateTypeName?: string;
  status?: string;
  created_at?: string | Date;
  updated_at?: string | Date;
  remarks?: string | null;
  form_data?: Record<string, string> | string | null;
  files?: { file_name?: string }[] | null;
}): CertificateRequest {
  const formData = typeof r.form_data === 'string' ? (() => { try { return JSON.parse(r.form_data); } catch { return {}; } })() : (r.form_data || {});
  const documents = (r.files || []).map((f) => f.file_name || '').filter(Boolean);
  const status = (r.status?.toLowerCase() ?? 'pending') as RequestStatus;
  return {
    id: r.id,
    residentId: r.resident_id ?? '',
    residentName: r.residentFullName ?? '',
    certificateType: 'barangay-clearance',
    certificateTypeName: r.certificateTypeName ?? '',
    status,
    dateRequested: formatDate(r.created_at),
    dateProcessed: status !== 'pending' ? formatDate(r.updated_at) : undefined,
    remarks: r.remarks ?? undefined,
    formData: formData as Record<string, string>,
    documents,
  };
}

export type CertificateType = 
  | 'barangay-clearance'
  | 'residency'
  | 'indigency'
  | 'business-clearance'
  | 'good-moral';

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'released';

export interface CertificateTypeInfo {
  id: CertificateType;
  name: string;
  description: string;
  fields: { name: string; label: string; type: 'text' | 'textarea' | 'date' | 'select'; required: boolean; options?: string[] }[];
  requirements: string[];
}

export interface CertificateRequest {
  id: string;
  residentId: string;
  residentName: string;
  certificateType: CertificateType;
  certificateTypeName: string;
  status: RequestStatus;
  dateRequested: string;
  dateProcessed?: string;
  remarks?: string;
  formData: Record<string, string>;
  documents: string[];
}

export const CERTIFICATE_TYPES: CertificateTypeInfo[] = [
  {
    id: 'barangay-clearance',
    name: 'Barangay Clearance',
    description: 'General purpose clearance from the barangay',
    fields: [
      { name: 'purpose', label: 'Purpose', type: 'text', required: true },
      { name: 'address', label: 'Complete Address', type: 'text', required: true },
      { name: 'yearsOfResidency', label: 'Years of Residency', type: 'text', required: true },
    ],
    requirements: ['Valid ID', 'Cedula'],
  },
  {
    id: 'residency',
    name: 'Certificate of Residency',
    description: 'Proof of residency in the barangay',
    fields: [
      { name: 'address', label: 'Complete Address', type: 'text', required: true },
      { name: 'duration', label: 'Duration of Stay', type: 'text', required: true },
      { name: 'purpose', label: 'Purpose', type: 'text', required: true },
    ],
    requirements: ['Valid ID', 'Proof of billing address'],
  },
  {
    id: 'indigency',
    name: 'Certificate of Indigency',
    description: 'Certification of financial need',
    fields: [
      { name: 'purpose', label: 'Purpose', type: 'select', required: true, options: ['Medical Assistance', 'Educational Assistance', 'Financial Assistance', 'Others'] },
      { name: 'monthlyIncome', label: 'Estimated Monthly Income', type: 'text', required: true },
      { name: 'additionalInfo', label: 'Additional Information', type: 'textarea', required: false },
    ],
    requirements: ['Valid ID', 'Cedula'],
  },
  {
    id: 'business-clearance',
    name: 'Business Clearance',
    description: 'Clearance for business operations within the barangay',
    fields: [
      { name: 'businessName', label: 'Business Name', type: 'text', required: true },
      { name: 'businessType', label: 'Type of Business', type: 'text', required: true },
      { name: 'businessAddress', label: 'Business Address', type: 'text', required: true },
      { name: 'owner', label: 'Owner/Operator', type: 'text', required: true },
    ],
    requirements: ['Valid ID', 'DTI Registration', 'Cedula'],
  },
  {
    id: 'good-moral',
    name: 'Certificate of Good Moral',
    description: 'Certification of good moral character',
    fields: [
      { name: 'purpose', label: 'Purpose', type: 'text', required: true },
      { name: 'address', label: 'Complete Address', type: 'text', required: true },
    ],
    requirements: ['Valid ID', 'Cedula'],
  },
];

export const MOCK_REQUESTS: CertificateRequest[] = [
  {
    id: 'REQ-001', residentId: '2', residentName: 'Juan Dela Cruz',
    certificateType: 'barangay-clearance', certificateTypeName: 'Barangay Clearance',
    status: 'pending', dateRequested: '2026-02-28',
    formData: { purpose: 'Employment', address: '123 Rizal St, Brgy. San Jose', yearsOfResidency: '5' },
    documents: ['valid_id.jpg'],
  },
  {
    id: 'REQ-002', residentId: '2', residentName: 'Juan Dela Cruz',
    certificateType: 'residency', certificateTypeName: 'Certificate of Residency',
    status: 'approved', dateRequested: '2026-02-25', dateProcessed: '2026-02-26',
    formData: { address: '123 Rizal St, Brgy. San Jose', duration: '5 years', purpose: 'Bank Application' },
    documents: ['valid_id.jpg', 'billing.pdf'],
  },
  {
    id: 'REQ-003', residentId: '3', residentName: 'Maria Santos',
    certificateType: 'indigency', certificateTypeName: 'Certificate of Indigency',
    status: 'pending', dateRequested: '2026-03-01',
    formData: { purpose: 'Medical Assistance', monthlyIncome: '5000', additionalInfo: 'For hospitalization' },
    documents: ['valid_id.jpg'],
  },
  {
    id: 'REQ-004', residentId: '4', residentName: 'Pedro Reyes',
    certificateType: 'business-clearance', certificateTypeName: 'Business Clearance',
    status: 'rejected', dateRequested: '2026-02-20', dateProcessed: '2026-02-22',
    remarks: 'Incomplete documents. Please submit DTI registration.',
    formData: { businessName: 'Reyes Sari-Sari Store', businessType: 'Retail', businessAddress: '456 Mabini St', owner: 'Pedro Reyes' },
    documents: ['valid_id.jpg'],
  },
  {
    id: 'REQ-005', residentId: '5', residentName: 'Ana Garcia',
    certificateType: 'good-moral', certificateTypeName: 'Certificate of Good Moral',
    status: 'released', dateRequested: '2026-02-15', dateProcessed: '2026-02-17',
    formData: { purpose: 'Scholarship Application', address: '789 Bonifacio Ave' },
    documents: ['valid_id.jpg', 'cedula.jpg'],
  },
];

export const MOCK_RESIDENTS = [
  { id: '2', name: 'Juan Dela Cruz', email: 'juan@example.com', address: '123 Rizal St', contact: '09171234567', registeredDate: '2026-01-15' },
  { id: '3', name: 'Maria Santos', email: 'maria@example.com', address: '456 Mabini St', contact: '09181234567', registeredDate: '2026-01-20' },
  { id: '4', name: 'Pedro Reyes', email: 'pedro@example.com', address: '789 Bonifacio Ave', contact: '09191234567', registeredDate: '2026-02-01' },
  { id: '5', name: 'Ana Garcia', email: 'ana@example.com', address: '321 Aguinaldo Rd', contact: '09201234567', registeredDate: '2026-02-10' },
];

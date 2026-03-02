import { useState } from 'react';
import { MOCK_REQUESTS, CertificateRequest, RequestStatus, CertificateType, CERTIFICATE_TYPES } from '@/services/mockData';
import { StatusBadge } from '@/components/StatusBadge';
import { RequestDetailsModal } from '@/components/RequestDetailsModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminRequests = () => {
  const [requests, setRequests] = useState<CertificateRequest[]>([...MOCK_REQUESTS]);
  const [selectedRequest, setSelectedRequest] = useState<CertificateRequest | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const { toast } = useToast();

  const filtered = requests.filter(r => {
    const matchSearch = r.residentName.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchType = typeFilter === 'all' || r.certificateType === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const updateRequest = (id: string, updates: Partial<CertificateRequest>) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const handleApprove = (id: string) => {
    updateRequest(id, { status: 'approved', dateProcessed: new Date().toISOString().split('T')[0] });
    toast({ title: 'Request Approved' });
  };

  const handleReject = (id: string, remarks: string) => {
    updateRequest(id, { status: 'rejected', dateProcessed: new Date().toISOString().split('T')[0], remarks });
    toast({ title: 'Request Rejected' });
  };

  const handleRelease = (id: string) => {
    updateRequest(id, { status: 'released' });
    toast({ title: 'Certificate Released' });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading">All Requests</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="released">Released</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Certificate Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {CERTIFICATE_TYPES.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card gov-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">ID</th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">Resident</th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">Certificate</th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">Date</th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((req) => (
                <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium">{req.id}</td>
                  <td className="px-6 py-4">{req.residentName}</td>
                  <td className="px-6 py-4">{req.certificateTypeName}</td>
                  <td className="px-6 py-4 text-muted-foreground">{req.dateRequested}</td>
                  <td className="px-6 py-4"><StatusBadge status={req.status} /></td>
                  <td className="px-6 py-4">
                    <Button variant="outline" size="sm" onClick={() => setSelectedRequest(req)}>View</Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">No requests found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RequestDetailsModal
        request={selectedRequest}
        open={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        isAdmin
        onApprove={handleApprove}
        onReject={handleReject}
        onRelease={handleRelease}
      />
    </div>
  );
};

export default AdminRequests;

import { useState, useEffect, useCallback } from 'react';
import { CertificateRequest } from '@/services/mockData';
import { mapApiRequestToCertRequest } from '@/lib/requestMap';
import { StatusBadge } from '@/components/StatusBadge';
import { RequestDetailsModal } from '@/components/RequestDetailsModal';
import { ViewCertificateModal } from '@/components/certificate/ViewCertificateModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Loader2, FileText, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { requestService, certificateService } from '@/services/api';

interface CertTypeFromApi {
  id: string;
  name: string;
}

const AdminRequests = () => {
  const [requests, setRequests] = useState<CertificateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<CertificateRequest | null>(null);
  const [certificateRequest, setCertificateRequest] = useState<CertificateRequest | null>(null);
  const [certificateAutoPrint, setCertificateAutoPrint] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [certTypes, setCertTypes] = useState<CertTypeFromApi[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    certificateService.getTypes().then((res) => {
      setCertTypes(res.data?.data?.certificateTypes ?? []);
    }).catch(() => {
      // Ignore
    });
  }, []);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await requestService.getAll({
        ...(statusFilter !== 'all' && { status: statusFilter.toUpperCase() }),
        ...(search.trim() && { search: search.trim() }),
      });
      const list = res.data?.requests ?? [];
      setRequests(list.map(mapApiRequestToCertRequest));
    } catch {
      toast({ title: 'Failed to load requests', variant: 'destructive' });
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, search, toast]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const openDetail = (req: CertificateRequest) => {
    requestService
      .getById(req.id)
      .then((res) => {
        const r = res.data?.data?.request;
        if (r) setSelectedRequest(mapApiRequestToCertRequest(r));
      })
      .catch(() => toast({ title: 'Failed to load request details', variant: 'destructive' }));
  };

  const filtered = requests.filter((r) => {
    const matchSearch =
      r.residentName.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchType = typeFilter === 'all' || r.certificateTypeName === (certTypes.find((c) => c.id === typeFilter)?.name ?? typeFilter);
    return matchSearch && matchStatus && matchType;
  });

  const handleApprove = (id: string) => {
    requestService
      .approve(id)
      .then(() => {
        toast({ title: 'Request Approved' });
        setSelectedRequest(null);
        fetchRequests();
      })
      .catch((err: unknown) => {
        const ax = err && typeof err === 'object' && 'response' in err ? (err as { response?: { data?: { message?: string } } }).response : undefined;
        toast({ title: 'Approve failed', description: ax?.data?.message ?? 'Something went wrong', variant: 'destructive' });
      });
  };

  const handleReject = (id: string, remarks: string) => {
    requestService
      .reject(id, remarks)
      .then(() => {
        toast({ title: 'Request Rejected' });
        setSelectedRequest(null);
        fetchRequests();
      })
      .catch((err: unknown) => {
        const ax = err && typeof err === 'object' && 'response' in err ? (err as { response?: { data?: { message?: string } } }).response : undefined;
        toast({ title: 'Reject failed', description: ax?.data?.message ?? 'Something went wrong', variant: 'destructive' });
      });
  };

  const handleRelease = (id: string) => {
    requestService
      .release(id)
      .then(() => {
        toast({ title: 'Certificate Released' });
        setSelectedRequest(null);
        fetchRequests();
      })
      .catch((err: unknown) => {
        const ax = err && typeof err === 'object' && 'response' in err ? (err as { response?: { data?: { message?: string } } }).response : undefined;
        toast({ title: 'Release failed', description: ax?.data?.message ?? 'Something went wrong', variant: 'destructive' });
      });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading">All Requests</h1>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="released">Released</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Certificate Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {certTypes.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card gov-shadow">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading requests...
            </div>
          ) : (
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
                    <td className="px-6 py-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        <Button variant="outline" size="sm" onClick={() => openDetail(req)}>
                          View
                        </Button>
                        {(req.status === 'approved' || req.status === 'released') && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setCertificateRequest(req);
                                setCertificateAutoPrint(false);
                              }}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              View Certificate
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setCertificateRequest(req);
                                setCertificateAutoPrint(true);
                              }}
                            >
                              <Printer className="h-4 w-4 mr-1" />
                              Print
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      No requests found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
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

      <ViewCertificateModal
        request={certificateRequest}
        open={!!certificateRequest}
        onClose={() => { setCertificateRequest(null); setCertificateAutoPrint(false); }}
        onSaved={() => { }}
        autoPrint={certificateAutoPrint}
      />
    </div>
  );
};

export default AdminRequests;

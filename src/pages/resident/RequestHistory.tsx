import { useState, useEffect } from 'react';
import { mapApiRequestToCertRequest } from '@/lib/requestMap';
import { StatusBadge } from '@/components/StatusBadge';
import { RequestDetailsModal } from '@/components/RequestDetailsModal';
import { CertificateRequest } from '@/services/mockData';
import { FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { requestService } from '@/services/api';

const RequestHistory = () => {
  const [requests, setRequests] = useState<CertificateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<CertificateRequest | null>(null);

  useEffect(() => {
    requestService
      .getMyRequests()
      .then((res) => {
        const list = res.data?.requests ?? [];
        setRequests(list.map(mapApiRequestToCertRequest));
      })
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, []);

  const openDetail = (req: CertificateRequest) => {
    requestService
      .getById(req.id)
      .then((res) => {
        const r = res.data?.data?.request;
        if (r) setSelectedRequest(mapApiRequestToCertRequest(r));
      })
      .catch(() => setSelectedRequest(req));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading">Request History</h1>

      <div className="rounded-lg border bg-card gov-shadow">
        {loading ? (
          <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading...
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mb-3 opacity-30" />
            <p>No requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">ID</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Certificate</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Date</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{req.id}</td>
                    <td className="px-6 py-4">{req.certificateTypeName}</td>
                    <td className="px-6 py-4 text-muted-foreground">{req.dateRequested}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-6 py-4">
                      <Button variant="outline" size="sm" onClick={() => openDetail(req)}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <RequestDetailsModal
        request={selectedRequest}
        open={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />
    </div>
  );
};

export default RequestHistory;

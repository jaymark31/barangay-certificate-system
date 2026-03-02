import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MOCK_REQUESTS } from '@/services/mockData';
import { StatusBadge } from '@/components/StatusBadge';
import { RequestDetailsModal } from '@/components/RequestDetailsModal';
import { CertificateRequest } from '@/services/mockData';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

const RequestHistory = () => {
  const { user } = useAuth();
  const [selectedRequest, setSelectedRequest] = useState<CertificateRequest | null>(null);
  const myRequests = MOCK_REQUESTS.filter(r => r.residentId === user?.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading">Request History</h1>

      <div className="rounded-lg border bg-card gov-shadow">
        {myRequests.length === 0 ? (
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
                {myRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{req.id}</td>
                    <td className="px-6 py-4">{req.certificateTypeName}</td>
                    <td className="px-6 py-4 text-muted-foreground">{req.dateRequested}</td>
                    <td className="px-6 py-4"><StatusBadge status={req.status} /></td>
                    <td className="px-6 py-4">
                      <Button variant="outline" size="sm" onClick={() => setSelectedRequest(req)}>View</Button>
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

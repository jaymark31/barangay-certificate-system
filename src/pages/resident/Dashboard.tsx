import { useState, useEffect } from 'react';
import { mapApiRequestToCertRequest } from '@/lib/requestMap';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { FileText, Clock, CheckCircle, XCircle, PlusCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { requestService } from '@/services/api';
import type { CertificateRequest } from '@/services/mockData';

const ResidentDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<CertificateRequest[]>([]);
  const [loading, setLoading] = useState(true);

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

  const pending = requests.filter((r) => r.status === 'pending').length;
  const approved = requests.filter((r) => r.status === 'approved' || r.status === 'released').length;
  const rejected = requests.filter((r) => r.status === 'rejected').length;
  const readyForPickup = requests.filter((r) => r.status === 'approved');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading">Welcome, {user?.name}</h1>
          <p className="text-sm text-muted-foreground">Manage your certificate requests</p>
        </div>
        <Link to="/resident/new-request">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> New Request
          </Button>
        </Link>
      </div>

      {readyForPickup.length > 0 && (
        <div className="rounded-lg border border-status-approved bg-status-approved-bg/40 px-6 py-4 text-sm">
          <p className="font-semibold text-status-approved">
            Your certificate request{readyForPickup.length > 1 ? 's' : ''} ha
            {readyForPickup.length > 1 ? 've' : 's'} been approved and is ready for pick-up at the barangay office.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Pending" value={pending} icon={Clock} />
        <StatCard title="Approved / Released" value={approved} icon={CheckCircle} />
        <StatCard title="Rejected" value={rejected} icon={XCircle} />
      </div>

      <div className="rounded-lg border bg-card gov-shadow">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold font-heading">Recent Requests</h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading...
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mb-3 opacity-30" />
            <p>No requests yet</p>
            <Link to="/resident/new-request" className="mt-2 text-sm text-primary hover:underline">
              Submit your first request
            </Link>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResidentDashboard;

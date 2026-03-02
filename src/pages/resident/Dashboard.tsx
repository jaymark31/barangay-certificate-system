import { useAuth } from '@/context/AuthContext';
import { MOCK_REQUESTS } from '@/services/mockData';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { FileText, Clock, CheckCircle, XCircle, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ResidentDashboard = () => {
  const { user } = useAuth();
  const myRequests = MOCK_REQUESTS.filter(r => r.residentId === user?.id);
  const pending = myRequests.filter(r => r.status === 'pending').length;
  const approved = myRequests.filter(r => r.status === 'approved' || r.status === 'released').length;
  const rejected = myRequests.filter(r => r.status === 'rejected').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading">Welcome, {user?.name}</h1>
          <p className="text-sm text-muted-foreground">Manage your certificate requests</p>
        </div>
        <Link to="/resident/new-request">
          <Button><PlusCircle className="mr-2 h-4 w-4" /> New Request</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Pending" value={pending} icon={Clock} />
        <StatCard title="Approved / Released" value={approved} icon={CheckCircle} />
        <StatCard title="Rejected" value={rejected} icon={XCircle} />
      </div>

      <div className="rounded-lg border bg-card gov-shadow">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold font-heading">Recent Requests</h2>
        </div>
        {myRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mb-3 opacity-30" />
            <p>No requests yet</p>
            <Link to="/resident/new-request" className="mt-2 text-sm text-primary hover:underline">Submit your first request</Link>
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
                {myRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{req.id}</td>
                    <td className="px-6 py-4">{req.certificateTypeName}</td>
                    <td className="px-6 py-4 text-muted-foreground">{req.dateRequested}</td>
                    <td className="px-6 py-4"><StatusBadge status={req.status} /></td>
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

import { MOCK_REQUESTS } from '@/services/mockData';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { FileText, Clock, CheckCircle, XCircle, Package } from 'lucide-react';

const AdminDashboard = () => {
  const total = MOCK_REQUESTS.length;
  const pending = MOCK_REQUESTS.filter(r => r.status === 'pending').length;
  const approved = MOCK_REQUESTS.filter(r => r.status === 'approved').length;
  const rejected = MOCK_REQUESTS.filter(r => r.status === 'rejected').length;
  const released = MOCK_REQUESTS.filter(r => r.status === 'released').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of certificate requests</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Total Requests" value={total} icon={FileText} />
        <StatCard title="Pending" value={pending} icon={Clock} />
        <StatCard title="Approved" value={approved} icon={CheckCircle} />
        <StatCard title="Rejected" value={rejected} icon={XCircle} />
        <StatCard title="Released" value={released} icon={Package} />
      </div>

      {/* Recent requests */}
      <div className="rounded-lg border bg-card gov-shadow">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold font-heading">Recent Requests</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">ID</th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">Resident</th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">Certificate</th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">Date</th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {MOCK_REQUESTS.slice(0, 5).map((req) => (
                <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium">{req.id}</td>
                  <td className="px-6 py-4">{req.residentName}</td>
                  <td className="px-6 py-4">{req.certificateTypeName}</td>
                  <td className="px-6 py-4 text-muted-foreground">{req.dateRequested}</td>
                  <td className="px-6 py-4"><StatusBadge status={req.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

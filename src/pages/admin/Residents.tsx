import { useState, useEffect } from 'react';
import { userService } from '@/services/api';
import { Loader2 } from 'lucide-react';

function formatDate(d: string | null | undefined): string {
  if (!d) return '—';
  const date = new Date(d);
  return date.toISOString().split('T')[0];
}

const AdminResidents = () => {
  const [residents, setResidents] = useState<{ id: string; name: string; email: string; contact: string; address: string; registeredDate: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService
      .getResidents()
      .then((res) => {
        const list = res.data?.data?.users ?? [];
        setResidents(
          list.map((u: { id: string; full_name?: string; email?: string; contact_number?: string; address?: string; created_at?: string }) => ({
            id: u.id,
            name: u.full_name ?? '',
            email: u.email ?? '',
            contact: u.contact_number ?? '—',
            address: u.address ?? '—',
            registeredDate: formatDate(u.created_at),
          }))
        );
      })
      .catch(() => setResidents([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading">Registered Residents</h1>

      <div className="rounded-lg border bg-card gov-shadow">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading residents...
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Name</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Email</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Contact</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Address</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {residents.map((res) => (
                  <tr key={res.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{res.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{res.email}</td>
                    <td className="px-6 py-4">{res.contact}</td>
                    <td className="px-6 py-4">{res.address}</td>
                    <td className="px-6 py-4 text-muted-foreground">{res.registeredDate}</td>
                  </tr>
                ))}
                {residents.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      No residents found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminResidents;

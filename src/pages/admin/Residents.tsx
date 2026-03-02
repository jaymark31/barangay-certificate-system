import { MOCK_RESIDENTS } from '@/services/mockData';
import { Users } from 'lucide-react';

const AdminResidents = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading">Registered Residents</h1>

      <div className="rounded-lg border bg-card gov-shadow">
        <div className="overflow-x-auto">
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
              {MOCK_RESIDENTS.map((res) => (
                <tr key={res.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium">{res.name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{res.email}</td>
                  <td className="px-6 py-4">{res.contact}</td>
                  <td className="px-6 py-4">{res.address}</td>
                  <td className="px-6 py-4 text-muted-foreground">{res.registeredDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminResidents;

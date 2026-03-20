import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_REQUESTS, CertificateRequest } from '@/services/mockData';
import { requestService } from '@/services/api';
import { mapApiRequestToCertRequest } from '@/lib/requestMap';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { useToast } from '@/hooks/use-toast';
import { FileText, Clock, CheckCircle, XCircle, Package, TrendingUp, Loader2, RefreshCw, BarChart3, PieChartIcon } from 'lucide-react';
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  PieChart, 
  Pie, 
  Cell,
  LabelList,
  Area,
  AreaChart,
  Line,
  LineChart,
  Dot
} from 'recharts';
import { 
  ChartConfig, 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [requests, setRequests] = useState<CertificateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await requestService.getAll();
      const list = res.data?.requests ?? res.data?.data?.requests ?? [];
      setRequests(list.map(mapApiRequestToCertRequest));
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch requests for dashboard:', error);
      setRequests(MOCK_REQUESTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, [fetchRequests]);

  const total = requests.length;
  const pending = requests.filter(r => r.status === 'pending').length;
  const approved = requests.filter(r => r.status === 'approved').length;
  const rejected = requests.filter(r => r.status === 'rejected').length;
  const released = requests.filter(r => r.status === 'released').length;

  const statusData = [
    { name: 'Pend', count: pending, gradientId: "pendingGrad" },
    { name: 'Appr', count: approved, gradientId: "approvedGrad" },
    { name: 'Rej', count: rejected, gradientId: "rejectedGrad" },
    { name: 'Rel', count: released, gradientId: "releasedGrad" },
  ];

  const typeCounts = requests.reduce((acc, req) => {
    acc[req.certificateTypeName] = (acc[req.certificateTypeName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeData = Object.entries(typeCounts).map(([name, count]) => ({
    name: name.split(' ').map(w => w[0]).join(''), // Abbreviate names for smaller charts
    fullName: name,
    count,
  })).sort((a, b) => b.count - a.count).slice(0, 5);

  const pieData = [
    { name: 'Pending', value: pending, fill: "#f59e0b" },
    { name: 'Approved', value: approved, fill: "#10b981" },
    { name: 'Rejected', value: rejected, fill: "#ef4444" },
    { name: 'Released', value: released, fill: "#3b82f6" },
  ];

  const chartConfig = {
    count: { label: "Requests" },
    pending: { label: "Pending", color: "#f59e0b" },
    approved: { label: "Approved", color: "#10b981" },
    rejected: { label: "Rejected", color: "#ef4444" },
    released: { label: "Released", color: "#3b82f6" },
  } satisfies ChartConfig;

  const monthlyCounts = requests.reduce((acc, req) => {
    const date = new Date(req.dateRequested);
    if (isNaN(date.getTime())) return acc;
    const month = date.toLocaleString('default', { month: 'short' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const trendData = monthOrder.map(m => ({
    name: m,
    count: monthlyCounts[m] || 0
  }));

  const topCertificate = typeData[0]?.fullName || 'N/A';
  const peakMonth = [...trendData].sort((a, b) => b.count - a.count)[0]?.name || 'N/A';

  return (
    <TooltipProvider delayDuration={100}>
    <div className="max-w-[1600px] mx-auto space-y-4 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading tracking-tight">Dashboard Overview</h1>
          <p className="text-xs text-muted-foreground italic flex items-center gap-1">
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <TrendingUp className="h-3 w-3" />}
            Live certificate processing metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded-full">{lastUpdated.toLocaleTimeString()}</span>
          <Button variant="outline" size="sm" onClick={() => fetchRequests()} disabled={loading} className="h-7 text-xs px-2">
            <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} /> Update
          </Button>
        </div>
      </div>

      {/* Stats row - more compact */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <StatCard title="Total" value={total} icon={FileText} className="h-24" />
        <StatCard title="Pending" value={pending} icon={Clock} className="h-24" />
        <StatCard title="Approved" value={approved} icon={CheckCircle} className="h-24" />
        <StatCard title="Rejected" value={rejected} icon={XCircle} className="h-24" />
        <StatCard title="Released" value={released} icon={Package} className="h-24" />
        <Card className="h-24 border-none bg-primary/10 flex flex-col justify-center p-3 relative overflow-hidden group">
          <div className="absolute -right-2 -top-2 text-primary/10 group-hover:text-primary/20 transition-colors"><FileText size={60} /></div>
          <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Top Pick</p>
          <p className="text-xs font-bold line-clamp-1 text-primary-foreground/90 mix-blend-difference">{topCertificate}</p>
          <p className="text-[9px] text-muted-foreground mt-1">Peak: {peakMonth}</p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Core metrics - smaller */}
        <Card className="gov-shadow border-none bg-white/70 backdrop-blur-sm lg:col-span-2">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b border-black/5">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" /> Status & Volume
            </CardTitle>
            <div className="flex gap-2">
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-primary" /> <span className="text-[10px]">Trend</span></div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Mini Column Chart */}
              <div className="p-4 border-r border-black/5">
                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-4">By Processing Stage (Click to view)</p>
                <ChartContainer config={chartConfig} className="h-[180px] w-full">
                  <BarChart data={statusData}>
                    <defs>
                      <linearGradient id="pendingGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6}/><stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/></linearGradient>
                      <linearGradient id="approvedGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/><stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/></linearGradient>
                      <linearGradient id="rejectedGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.6}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/></linearGradient>
                      <linearGradient id="releasedGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/></linearGradient>
                    </defs>
                    <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={9} />
                    <YAxis hide />
                    <ChartTooltip cursor={{ fill: 'rgba(0,0,0,0.05)', radius: 4 }} content={<ChartTooltipContent hideLabel />} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={30} className="cursor-pointer">
                      {statusData.map((entry, index) => {
                        const statusMap: Record<string, string> = { "Pend": "pending", "Appr": "approved", "Rej": "rejected", "Rel": "released" };
                        return (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={`url(#${entry.gradientId})`} 
                            onClick={() => navigate(`/admin/requests?status=${statusMap[entry.name]}`)}
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </div>
              {/* Zigzag Trend Chart */}
              <div className="p-4">
                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-4">Yearly Operational Trends (2026)</p>
                <ChartContainer config={chartConfig} className="h-[180px] w-full">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={9} />
                    <YAxis hide />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="linear" 
                      dataKey="count" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4, stroke: 'white' }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                      animationDuration={1500}
                    />
                  </LineChart>
                </ChartContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Pie - smaller */}
        <Card className="gov-shadow border-none bg-white/70 backdrop-blur-sm">
          <CardHeader className="py-3 px-4 border-b border-black/5">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-primary" /> Ratio
            </CardTitle>
          </CardHeader>
          <CardContent className="relative flex items-center justify-center p-2">
            <ChartContainer config={chartConfig} className="h-[210px] w-full">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={70} paddingAngle={4} className="cursor-pointer">
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.fill} 
                      fillOpacity={0.8} 
                      onClick={() => navigate(`/admin/requests?status=${entry.name.toLowerCase()}`)}
                    />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent />} className="text-[8px]" />
              </PieChart>
            </ChartContainer>
            <div className="absolute top-[44%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <span className="text-xl font-extrabold block">{total}</span>
              <span className="text-[7px] uppercase font-bold text-muted-foreground tracking-tighter">Requests</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Popular types - compact */}
      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-12 gov-shadow border-none bg-white/70 backdrop-blur-sm">
          <CardHeader className="py-2 px-4 border-b border-black/5">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Recent Activity & Volume</CardTitle>
          </CardHeader>
          <div className="grid lg:grid-cols-3">
             <div className="lg:col-span-2 border-r border-black/5 rounded-bl-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-[11px]">
                        <thead className="bg-muted/30">
                            <tr>
                                <th className="px-4 py-2 text-left font-bold text-muted-foreground">ID</th>
                                <th className="px-4 py-2 text-left font-bold text-muted-foreground">Resident</th>
                                <th className="px-4 py-2 text-left font-bold text-muted-foreground">Type</th>
                                <th className="px-4 py-2 text-left font-bold text-muted-foreground">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                            {requests.slice(0, 4).map((req) => (
                                <tr key={req.id} className="hover:bg-muted/20 transition-colors">
                                    <td className="px-4 py-2 font-medium">{req.id}</td>
                                    <td className="px-4 py-2 line-clamp-1">{req.residentName}</td>
                                    <td className="px-4 py-2 text-muted-foreground">{req.certificateTypeName}</td>
                                    <td className="px-4 py-2"><StatusBadge status={req.status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-2 border-t border-black/5 text-center">
                    <Button variant="ghost" size="sm" className="h-6 text-[10px] text-primary" asChild>
                        <a href="/admin/requests">View full list →</a>
                    </Button>
                </div>
             </div>
             <div className="p-4 flex flex-col justify-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Demand by Type (Hover for top)</p>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div>
                            <ChartContainer config={chartConfig} className="h-[120px] w-full cursor-help">
                                <BarChart 
                                  layout="vertical" 
                                  data={typeData} 
                                  margin={{ left: -20 }}
                                >
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" hide />
                                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 2, 2, 0]} barSize={12}>
                                        <LabelList dataKey="name" position="insideLeft" style={{ fill: 'white', fontSize: '8px' }} />
                                    </Bar>
                                </BarChart>
                            </ChartContainer>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-primary text-primary-foreground font-bold p-2 text-xs">
                        Most Requested: {topCertificate}
                    </TooltipContent>
                </Tooltip>
             </div>
          </div>
        </Card>
      </div>
    </div>
    </TooltipProvider>
  );
};

export default AdminDashboard;

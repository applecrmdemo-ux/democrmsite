import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useDashboardStats } from "@/hooks/use-dashboard";
import { Users, Package, Wrench, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Currency } from "@/components/Currency";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

// Mock data for charts - in real app, fetch from API
const salesData = [
  { name: 'Jan', revenue: 4000, repairs: 2400 },
  { name: 'Feb', revenue: 3000, repairs: 1398 },
  { name: 'Mar', revenue: 2000, repairs: 9800 },
  { name: 'Apr', revenue: 2780, repairs: 3908 },
  { name: 'May', revenue: 1890, repairs: 4800 },
  { name: 'Jun', revenue: 2390, repairs: 3800 },
  { name: 'Jul', revenue: 3490, repairs: 4300 },
];

function StatCard({ title, value, icon: Icon, description, trend }: any) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-300 overflow-hidden relative">
      <div className="absolute right-0 top-0 h-24 w-24 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full -mr-4 -mt-4" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="p-2 bg-primary/10 rounded-full text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          {trend && (
            <span className={trend === 'up' ? "text-green-600 flex items-center" : "text-red-600 flex items-center"}>
              {trend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
              12%
            </span>
          )}
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function StatSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-[60px] mb-2" />
        <Skeleton className="h-3 w-[120px]" />
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  return (
    <Layout title="Dashboard" description="Overview of your business performance">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          <>
            <StatCard 
              title="Total Revenue" 
              value={<Currency amount={stats?.totalRevenue || 0} />} 
              icon={DollarSign}
              description="from last month"
              trend="up"
            />
            <StatCard 
              title="Active Repairs" 
              value={stats?.activeRepairs || 0} 
              icon={Wrench}
              description="+2 since yesterday"
              trend="up"
            />
            <StatCard 
              title="Total Customers" 
              value={stats?.totalCustomers || 0} 
              icon={Users}
              description="active clients"
              trend="up"
            />
            <StatCard 
              title="Products in Stock" 
              value={stats?.totalProducts || 0} 
              icon={Package}
              description={`${stats?.lowStockProducts || 0} low stock items`}
              trend="down"
            />
          </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue breakdown for the current year</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Repair Volume</CardTitle>
            <CardDescription>Completed vs In-progress repairs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <Tooltip 
                    cursor={{fill: 'hsl(var(--muted))', opacity: 0.4}}
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                  />
                  <Bar dataKey="repairs" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

import { useEffect, useMemo, useState } from 'react';
import {
  Activity, ArrowUpRight, Building2, CalendarDays, RefreshCw,
  UserCheck, Users, UserPlus, ClipboardCheck, AlertCircle,
} from 'lucide-react';
import {
  Cell, Pie, PieChart, ResponsiveContainer, Tooltip as ChartTooltip,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/services/api';

type DashboardStats = {
  totalEmployees: number;
  activeEmployees: number;
  departments: number;
  newEmployeesThisMonth: number;
  pendingReviews: number;
  onLeave: number;
};

type Employee = {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  official_email: string;
  department_name?: string | null;
  designation_name?: string | null;
  employment_status: string;
  joining_date?: string | null;
};

type Department = { id: string; name: string; employee_count?: number };

const EMPTY_STATS: DashboardStats = {
  totalEmployees: 0, activeEmployees: 0, departments: 0,
  newEmployeesThisMonth: 0, pendingReviews: 0, onLeave: 0,
};
const COLORS = ['#4f46e5', '#0d9488', '#f59e0b', '#e879f9', '#64748b', '#0284c7'];

function StatCard({ title, value, icon: Icon, hint }: {
  title: string; value: number; icon: typeof Users; hint: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <span className="rounded-lg bg-primary/10 p-2 text-primary"><Icon className="h-4 w-4" /></span>
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-foreground">{value.toLocaleString()}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function initials(employee: Employee) {
  return `${employee.first_name?.[0] ?? ''}${employee.last_name?.[0] ?? ''}`.toUpperCase();
}

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsResult, employeesResult, departmentsResult] = await Promise.allSettled([
        apiRequest<DashboardStats>('/reports/dashboard'),
        apiRequest<{ items: Employee[] }>('/employees?limit=6&page=1'),
        apiRequest<Department[]>('/departments'),
      ]);

      if (statsResult.status === 'fulfilled') setStats({ ...EMPTY_STATS, ...statsResult.value });
      else throw statsResult.reason;

      setEmployees(employeesResult.status === 'fulfilled' ? employeesResult.value.items ?? [] : []);
      setDepartments(departmentsResult.status === 'fulfilled' ? departmentsResult.value ?? [] : []);
      if (employeesResult.status === 'rejected' || departmentsResult.status === 'rejected') {
        setError('Some dashboard sections could not be loaded. Check your account permissions and API responses.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadDashboard(); }, []);

  const departmentChart = useMemo(
    () => departments.map((department) => ({
      name: department.name,
      value: Number(department.employee_count ?? 0),
    })).filter((item) => item.value > 0),
    [departments],
  );

  const today = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date());

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{today}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            Welcome back, {user?.name?.split(' ')[0] ?? 'there'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Here’s what’s happening across your organization.</p>
        </div>
        <Button variant="outline" onClick={() => void loadDashboard()} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh data
        </Button>
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-foreground">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div className="min-w-0">
            <p className="font-medium">Dashboard data could not be fully loaded</p>
            <p className="mt-1 text-muted-foreground">{error}</p>
          </div>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard title="Total employees" value={loading ? 0 : stats.totalEmployees} icon={Users} hint="Employees in the organization" />
        <StatCard title="Active employees" value={loading ? 0 : stats.activeEmployees} icon={UserCheck} hint="Currently active" />
        <StatCard title="Departments" value={loading ? 0 : stats.departments} icon={Building2} hint="Active departments" />
        <StatCard title="New this month" value={loading ? 0 : stats.newEmployeesThisMonth} icon={UserPlus} hint="Recent joiners" />
        <StatCard title="On leave" value={loading ? 0 : stats.onLeave} icon={CalendarDays} hint="Employees currently on leave" />
        <StatCard title="Pending reviews" value={loading ? 0 : stats.pendingReviews} icon={ClipboardCheck} hint="Reviews awaiting action" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-foreground">Recent employees</h2>
              <p className="mt-1 text-sm text-muted-foreground">Latest employee records added to PeopleOS</p>
            </div>
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="pb-3 font-medium">Employee</th>
                  <th className="pb-3 font-medium">Department</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={3} className="py-8 text-center text-muted-foreground">Loading employees…</td></tr>
                ) : employees.length ? employees.map((employee) => (
                  <tr key={employee.id} className="border-b border-border/70 last:border-0">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{initials(employee)}</span>
                        <span className="min-w-0">
                          <span className="block font-medium text-foreground">{employee.first_name} {employee.last_name}</span>
                          <span className="block text-xs text-muted-foreground">{employee.official_email}</span>
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-muted-foreground">{employee.department_name || 'Unassigned'}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                        {employee.employment_status || 'Unknown'}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={3} className="py-8 text-center text-muted-foreground">No employee records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-foreground">Department distribution</h2>
              <p className="mt-1 text-sm text-muted-foreground">Employees by department</p>
            </div>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </div>
          {loading ? (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">Loading department data…</div>
          ) : departmentChart.length ? (
            <>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={departmentChart} dataKey="value" nameKey="name" innerRadius={58} outerRadius={86} paddingAngle={3}>
                      {departmentChart.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <ChartTooltip formatter={(value: number) => [`${value} employees`, 'Employees']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {departmentChart.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="truncate">{item.name}</span>
                    <span className="ml-auto font-medium text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <Building2 className="h-8 w-8 text-muted-foreground/50" />
              <p className="mt-3 text-sm font-medium text-foreground">No department data yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Department distribution will appear when employees are assigned.</p>
            </div>
          )}
        </div>
      </section>

      <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-xs text-muted-foreground">
        <ArrowUpRight className="h-4 w-4 shrink-0" />
        Dashboard figures are loaded from your PeopleOS API. Data changes in Neon will appear after refreshing.
      </div>
    </div>
  );
}

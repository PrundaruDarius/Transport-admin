import { useCallback, useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ErrorBox from "../components/ErrorBox.jsx";
import Loader from "../components/Loader.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { dashboardService } from "../services/dashboardService.js";
import { getErrorMessage } from "../utils/formatters.js";

function StatCard({ title, value, subtitle }) {
  return (
    <div className="rounded-2xl border border-slate-200 border-t-4 border-t-[#00c853] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <p className="text-sm font-medium text-slate-500">{title}</p>

      <p className="mt-2 text-3xl font-bold text-slate-900">
        {value ?? 0}
      </p>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
      )}
    </div>
  );
}

function normalizeRevenue(item) {
  return {
    month: item.month ?? item.Month ?? "",
    ticketRevenue: item.ticketRevenue ?? item.TicketRevenue ?? 0,
    subscriptionRevenue:
      item.subscriptionRevenue ?? item.SubscriptionRevenue ?? 0,
    totalRevenue: item.totalRevenue ?? item.TotalRevenue ?? 0,
  };
}

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState({});
  const [revenue, setRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [dashboardData, revenueData] = await Promise.all([
        dashboardService.getDashboard(),
        dashboardService.getMonthlyRevenue(),
      ]);

      setDashboard(dashboardData || {});

      setRevenue(
        Array.isArray(revenueData)
          ? revenueData.map(normalizeRevenue)
          : []
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) return <Loader />;

  const currentMonth = new Date().toISOString().slice(0, 7);

  const currentMonthRevenue =
    revenue.find((item) => item.month === currentMonth)?.totalRevenue ??
    dashboard.monthlyRevenue ??
    0;

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Statistici generale pentru aplicația TransportApp."
      />

      <ErrorBox message={error} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total utilizatori"
          value={dashboard.totalUsers}
          subtitle="Utilizatori normali"
        />

        <StatCard
          title="Controlori"
          value={dashboard.totalControllers}
          subtitle="Utilizatori cu rol Controller"
        />

        <StatCard
          title="Bilete active"
          value={dashboard.activeTickets}
          subtitle="Bilete utilizabile momentan"
        />

        <StatCard
          title="Abonamente active"
          value={dashboard.activeSubscriptions}
          subtitle="Abonamente valabile"
        />

        <StatCard
          title="Linii active"
          value={dashboard.activeLines}
          subtitle="Linii cu isActive = true"
        />

        <StatCard
          title="Linii inactive"
          value={dashboard.inactiveLines}
          subtitle="Linii cu isActive = false"
        />

        <StatCard
          title="Încasări lunare"
          value={`${currentMonthRevenue} lei`}
          subtitle={`Luna curentă: ${currentMonth}`}
        />
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-900">
            Încasări lunare
          </h2>

          <p className="text-sm text-slate-500">
            Bilete, abonamente și total lunar.
          </p>
        </div>

        {revenue.length === 0 ? (
          <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
            Nu există date pentru grafic.
          </div>
        ) : (
          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />

                <Bar
                  dataKey="ticketRevenue"
                  name="Bilete"
                  fill="#10b981"
                />

                <Bar
                  dataKey="subscriptionRevenue"
                  name="Abonamente"
                  fill="#f59e0b"
                />

                <Bar
                  dataKey="totalRevenue"
                  name="Total"
                  fill="#475569"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </>
  );
}
import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AdminContext } from "../../context/AdminContext";

const Dashboard = () => {
  const { aToken, backendUrl } = useContext(AdminContext);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    cards: {
      totalUsers: 0,
      totalDoctors: 0,
      totalAppointments: 0,
      revenue: 0,
    },
    breakdown: { pending: 0, confirmed: 0, cancelled: 0, completed: 0 },
    today: { bookedToday: 0, scheduledToday: 0 },
    recentAppointments: [],
  });

  const fmtTHB = (n) =>
    new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(n || 0);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post(
        `${backendUrl}/api/admin/dashboard-stats`,
        {},
        { headers: { aToken } }
      );
      if (data?.success) {
        setStats({
          cards: data.cards || stats.cards,
          breakdown: data.breakdown || stats.breakdown,
          today: data.today || stats.today,
          recentAppointments: Array.isArray(data.recentAppointments)
            ? data.recentAppointments
            : [],
        });
      } else {
        toast.error(data?.message || "Failed to load dashboard stats");
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err.message ||
          "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!aToken) return;
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aToken]);

  const statusBadge = (a) => {
    if (a.cancelled) {
      return (
        <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-700">
          Cancelled
        </span>
      );
    }
    if (a.isCompleted) {
      return (
        <span className="px-2 py-0.5 rounded text-xs bg-emerald-100 text-emerald-700">
          Completed
        </span>
      );
    }
    if (a.confirmed) {
      return (
        <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700">
          Confirmed
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-700">
        Pending
      </span>
    );
  };

  const totalInBreakdown = useMemo(
    () =>
      (stats.breakdown.pending || 0) +
      (stats.breakdown.confirmed || 0) +
      (stats.breakdown.cancelled || 0) +
      (stats.breakdown.completed || 0),
    [stats.breakdown]
  );

  const pct = (val) =>
    totalInBreakdown ? Math.round(((val || 0) / totalInBreakdown) * 100) : 0;

  return (
    <div className="p-4 md:p-6 w-full">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-semibold">Admin Dashboard</h2>
        <button
          onClick={fetchStats}
          className="text-sm px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded border p-4">
          <div className="text-gray-500 text-xs">Total Users</div>
          <div className="text-2xl font-semibold">{stats.cards.totalUsers}</div>
        </div>
        <div className="bg-white rounded border p-4">
          <div className="text-gray-500 text-xs">Total Doctors</div>
          <div className="text-2xl font-semibold">
            {stats.cards.totalDoctors}
          </div>
        </div>
        <div className="bg-white rounded border p-4">
          <div className="text-gray-500 text-xs">Total Appointments</div>
          <div className="text-2xl font-semibold">
            {stats.cards.totalAppointments}
          </div>
        </div>
        <div className="bg-white rounded border p-4">
          <div className="text-gray-500 text-xs">Revenue (Completed)</div>
          <div className="text-2xl font-semibold">
            {fmtTHB(stats.cards.revenue)}
          </div>
        </div>
      </div>

      {/* Breakdown + Today */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded border p-4 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">Appointments Breakdown</h3>
            <div className="text-xs text-gray-500">
              Total: {totalInBreakdown}
            </div>
          </div>

          <div className="space-y-3">
            {[
              {
                label: "Pending",
                value: stats.breakdown.pending,
                color: "bg-amber-500",
              },
              {
                label: "Confirmed",
                value: stats.breakdown.confirmed,
                color: "bg-blue-500",
              },
              {
                label: "Cancelled",
                value: stats.breakdown.cancelled,
                color: "bg-red-500",
              },
              {
                label: "Completed",
                value: stats.breakdown.completed,
                color: "bg-emerald-500",
              },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{row.label}</span>
                  <span className="text-gray-500">
                    {row.value} ({pct(row.value)}%)
                  </span>
                </div>
                <div className="h-2 rounded bg-gray-100 overflow-hidden">
                  <div
                    className={`h-2 ${row.color}`}
                    style={{ width: `${pct(row.value)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded border p-4">
          <h3 className="font-semibold mb-3">Today</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm">Booked Today</span>
              <span className="text-lg font-semibold">
                {stats.today.bookedToday}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm">Scheduled Today</span>
              <span className="text-lg font-semibold">
                {stats.today.scheduledToday}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="bg-white rounded border p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">Recent Appointments</h3>
          <div className="text-xs text-gray-500">Latest 5</div>
        </div>

        {loading ? (
          <div className="text-gray-500">Loading…</div>
        ) : stats.recentAppointments.length === 0 ? (
          <div className="text-gray-500">No recent appointments.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="text-left px-4 py-2">ID</th>
                  <th className="text-left px-4 py-2">Doctor</th>
                  <th className="text-left px-4 py-2">User</th>
                  <th className="text-left px-4 py-2">Date</th>
                  <th className="text-left px-4 py-2">Time</th>
                  <th className="text-left px-4 py-2">Amount</th>
                  <th className="text-left px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentAppointments.map((a) => (
                  <tr key={a._id} className="border-t">
                    <td className="px-4 py-2 align-top font-mono">
                      {a._id?.slice(-6)?.toUpperCase()}
                      <div className="text-xs text-gray-500">
                        {a.date ? new Date(a.date).toLocaleString() : "—"}
                      </div>
                    </td>
                    <td className="px-4 py-2 align-top">
                      <div className="font-medium">
                        {a?.docData?.name || "—"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {a?.docData?.speciality || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-2 align-top">
                      <div className="font-medium">
                        {a?.userData?.name || "—"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {a?.userData?.email || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-2 align-top">
                      {a?.slotDate || "—"}
                    </td>
                    <td className="px-4 py-2 align-top">
                      {a?.slotTime || "—"}
                    </td>
                    <td className="px-4 py-2 align-top">{fmtTHB(a?.amount)}</td>
                    <td className="px-4 py-2 align-top">{statusBadge(a)}</td>
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

export default Dashboard;

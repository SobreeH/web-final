import React, { useContext, useEffect, useMemo, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";

const DocDashboard = () => {
  const { dToken, myAppointments, getMyAppointments } =
    useContext(DoctorContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      if (!dToken) return;
      setLoading(true);
      await getMyAppointments();
      setLoading(false);
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dToken]);

  // Today (server-local notion not available on client; we use client local for display)
  const todayStr = new Date().toISOString().slice(0, 10);

  const scheduledToday = useMemo(
    () => myAppointments.filter((a) => a.slotDate === todayStr).length,
    [myAppointments, todayStr]
  );

  const upcoming = useMemo(
    () =>
      myAppointments.filter((a) => !a.cancelled && !a.isCompleted).slice(0, 5),
    [myAppointments]
  );

  return (
    <div className="p-4 md:p-6 w-full">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-semibold">Doctor Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded border p-4">
          <div className="text-xs text-gray-500">My Appointments</div>
          <div className="text-2xl font-semibold">{myAppointments.length}</div>
        </div>
        <div className="bg-white rounded border p-4">
          <div className="text-xs text-gray-500">Scheduled Today</div>
          <div className="text-2xl font-semibold">{scheduledToday}</div>
        </div>
        <div className="bg-white rounded border p-4">
          <div className="text-xs text-gray-500">Upcoming (next 5)</div>
          <div className="text-2xl font-semibold">
            {
              myAppointments.filter((a) => !a.cancelled && !a.isCompleted)
                .length
            }
          </div>
        </div>
      </div>

      <div className="bg-white rounded border p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">Quick View — Upcoming</h3>
          <div className="text-xs text-gray-500">Top 5</div>
        </div>
        {loading ? (
          <div className="text-gray-500">Loading…</div>
        ) : upcoming.length === 0 ? (
          <div className="text-gray-500">No upcoming appointments.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[700px] w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="text-left px-4 py-2">User</th>
                  <th className="text-left px-4 py-2">Email</th>
                  <th className="text-left px-4 py-2">Date</th>
                  <th className="text-left px-4 py-2">Time</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map((a) => (
                  <tr key={a._id} className="border-t">
                    <td className="px-4 py-2">{a?.userData?.name || "—"}</td>
                    <td className="px-4 py-2">{a?.userData?.email || "—"}</td>
                    <td className="px-4 py-2">{a?.slotDate || "—"}</td>
                    <td className="px-4 py-2">{a?.slotTime || "—"}</td>
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

export default DocDashboard;

import React, { useContext, useEffect, useMemo, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { useNavigate } from "react-router-dom";

const DocAppointments = () => {
  const {
    dToken,
    myAppointments,
    getMyAppointments,
    completeAppointment,
    deleteAppointment,
  } = useContext(DoctorContext);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  const sorted = useMemo(() => {
    return [...(myAppointments || [])].sort(
      (a, b) => (b?.date || 0) - (a?.date || 0)
    );
  }, [myAppointments]);

  const statusBadge = (a) => {
    if (a.cancelled)
      return (
        <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-700">
          Cancelled
        </span>
      );
    if (a.isCompleted)
      return (
        <span className="px-2 py-0.5 rounded text-xs bg-emerald-100 text-emerald-700">
          Completed
        </span>
      );
    if (a.confirmed)
      return (
        <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700">
          Confirmed
        </span>
      );
    return (
      <span className="px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-700">
        Pending
      </span>
    );
  };

  const onComplete = async (id, a) => {
    if (a.cancelled) return;
    await completeAppointment(id);
  };

  const onDelete = async (id) => {
    const yes = window.confirm(
      "Delete this appointment? This will also free its slot."
    );
    if (!yes) return;
    await deleteAppointment(id);
  };

  return (
    <div className="p-4 md:p-6 w-full">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-semibold">My Appointments</h2>
        <div className="flex gap-2">
          <button
            onClick={() => getMyAppointments()}
            className="text-sm px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50"
          >
            Refresh
          </button>
          <button
            onClick={() => navigate("/doctor-appointments/create")}
            className="text-sm px-3 py-1.5 rounded bg-primary text-white hover:opacity-90"
          >
            Create
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading…</div>
      ) : sorted.length === 0 ? (
        <div className="text-gray-500">No appointments found.</div>
      ) : (
        <div className="overflow-x-auto border rounded">
          <table className="min-w-[900px] w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left px-4 py-2">User</th>
                <th className="text-left px-4 py-2">Email</th>
                <th className="text-left px-4 py-2">Date</th>
                <th className="text-left px-4 py-2">Time</th>
                <th className="text-left px-4 py-2">Amount (THB)</th>
                <th className="text-left px-4 py-2">Status</th>
                <th className="text-left px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((a) => (
                <tr key={a._id} className="border-t">
                  <td className="px-4 py-2">{a?.userData?.name || "—"}</td>
                  <td className="px-4 py-2">{a?.userData?.email || "—"}</td>
                  <td className="px-4 py-2">{a?.slotDate || "—"}</td>
                  <td className="px-4 py-2">{a?.slotTime || "—"}</td>
                  <td className="px-4 py-2">{a?.amount ?? "—"}</td>
                  <td className="px-4 py-2">{statusBadge(a)}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          navigate(`/doctor-appointments/${a._id}/edit`)
                        }
                        disabled={a.cancelled || a.isCompleted}
                        className="px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onComplete(a._id, a)}
                        disabled={a.cancelled || a.isCompleted}
                        className="px-3 py-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => onDelete(a._id)}
                        className="px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DocAppointments;

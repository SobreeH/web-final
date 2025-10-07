import React, {
  useEffect,
  useState,
  useContext,
  useMemo,
  useCallback,
} from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AdminContext } from "../../context/AdminContext";

const AllApointments = () => {
  const { aToken, backendUrl } = useContext(AdminContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const headers = useMemo(() => ({ aToken }), [aToken]);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.post(
        `${backendUrl}/api/admin/all-appointments`,
        {},
        { headers }
      );
      if (data?.success) {
        setAppointments(
          Array.isArray(data.appointments) ? data.appointments : []
        );
      } else {
        toast.error(data?.message || "Failed to load appointments");
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err.message ||
          "Failed to load appointments"
      );
    } finally {
      setLoading(false);
    }
  }, [backendUrl, headers]);

  useEffect(() => {
    if (!aToken) return;
    fetchAppointments();
  }, [aToken, fetchAppointments]);

  const statusBadge = (appt) => {
    if (appt.cancelled)
      return (
        <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-700">
          Cancelled
        </span>
      );
    if (appt.isCompleted)
      return (
        <span className="px-2 py-1 rounded text-xs bg-emerald-100 text-emerald-700">
          Completed
        </span>
      );
    if (appt.confirmed)
      return (
        <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">
          Confirmed
        </span>
      );
    return (
      <span className="px-2 py-1 rounded text-xs bg-amber-100 text-amber-700">
        Pending
      </span>
    );
  };

  const handleDelete = async (id) => {
    const yes = window.confirm(
      "Delete this appointment permanently? This cannot be undone."
    );
    if (!yes) return;

    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/admin/appointment/${id}`,
        { headers }
      );
      if (data?.success) {
        setAppointments((prev) => prev.filter((a) => a._id !== id));
        toast.success(data?.message || "Appointment deleted");
      } else {
        toast.error(data?.message || "Failed to delete appointment");
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err.message ||
          "Failed to delete appointment"
      );
    }
  };

  const fmtMoney = (n) =>
    typeof n === "number"
      ? n.toLocaleString(undefined, {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 2,
        })
      : n;

  const sorted = useMemo(() => {
    return [...appointments].sort((a, b) => (b?.date || 0) - (a?.date || 0));
  }, [appointments]);

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-semibold">All Appointments</h2>
        <button
          onClick={fetchAppointments}
          className="text-sm px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading appointments…</div>
      ) : sorted.length === 0 ? (
        <div className="text-gray-500">No appointments found.</div>
      ) : (
        <div className="overflow-x-auto border rounded">
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
                <th className="text-left px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((a) => (
                <tr key={a._id} className="border-t">
                  <td className="px-4 py-2 align-top">
                    <div className="font-mono">
                      {a._id?.slice(-6).toUpperCase()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(a.date || 0).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-2 align-top">
                    <div className="font-medium">{a?.docData?.name || "—"}</div>
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
                  <td className="px-4 py-2 align-top">{a?.slotDate || "—"}</td>
                  <td className="px-4 py-2 align-top">{a?.slotTime || "—"}</td>
                  <td className="px-4 py-2 align-top">{fmtMoney(a?.amount)}</td>
                  <td className="px-4 py-2 align-top">{statusBadge(a)}</td>
                  <td className="px-4 py-2 align-top">
                    <button
                      onClick={() => handleDelete(a._id)}
                      className="px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
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

export default AllApointments;

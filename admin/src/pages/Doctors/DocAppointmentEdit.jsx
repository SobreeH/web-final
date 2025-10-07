import React, { useContext, useEffect, useMemo, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { useNavigate, useParams } from "react-router-dom";

const DocAppointmentEdit = () => {
  const { id } = useParams();
  const { myAppointments, getMyAppointments, updateAppointment } =
    useContext(DoctorContext);
  const navigate = useNavigate();

  const [slotDate, setSlotDate] = useState("");
  const [slotTime, setSlotTime] = useState("");
  const [amount, setAmount] = useState("");

  const appt = useMemo(
    () => myAppointments.find((a) => a._id === id),
    [myAppointments, id]
  );

  useEffect(() => {
    (async () => {
      if (!appt) {
        await getMyAppointments();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (appt) {
      setSlotDate(appt.slotDate || "");
      setSlotTime(appt.slotTime || "");
      setAmount(appt.amount ?? "");
    }
  }, [appt]);

  if (!appt) {
    return (
      <div className="p-4 md:p-6 w-full">
        <div className="text-gray-500">Loading appointment…</div>
      </div>
    );
  }

  const readOnly = appt.cancelled || appt.isCompleted;

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = {};
    if (slotDate !== appt.slotDate) payload.slotDate = slotDate;
    if (slotTime !== appt.slotTime) payload.slotTime = slotTime;
    if (amount !== "" && Number(amount) !== appt.amount)
      payload.amount = Number(amount);

    const ok = await updateAppointment(id, payload);
    if (ok) navigate("/doctor-appointments");
  };

  return (
    <div className="p-4 md:p-6 w-full">
      <h2 className="text-xl md:text-2xl font-semibold mb-4">
        Edit Appointment
      </h2>

      {readOnly && (
        <div className="mb-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded">
          This appointment cannot be edited because it is{" "}
          {appt.cancelled ? "cancelled" : "completed"}.
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="bg-white rounded border p-4 space-y-3 max-w-lg"
      >
        <div className="text-sm text-gray-500">
          <div>
            Patient:{" "}
            <span className="font-medium">{appt?.userData?.name || "—"}</span> (
            {appt?.userData?.email || "—"})
          </div>
          <div>
            ID: <span className="font-mono">{appt._id}</span>
          </div>
        </div>

        <div>
          <label className="text-sm">Slot Date</label>
          <input
            type="text"
            value={slotDate}
            onChange={(e) => setSlotDate(e.target.value)}
            className="w-full border rounded p-2 mt-1"
            disabled={readOnly}
            required
          />
        </div>

        <div>
          <label className="text-sm">Slot Time</label>
          <input
            type="text"
            value={slotTime}
            onChange={(e) => setSlotTime(e.target.value)}
            className="w-full border rounded p-2 mt-1"
            disabled={readOnly}
            required
          />
        </div>

        <div>
          <label className="text-sm">Amount (THB)</label>
          <input
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border rounded p-2 mt-1"
            disabled={readOnly}
          />
        </div>

        <div className="flex gap-2">
          <button
            className="px-3 py-1.5 rounded bg-primary text-white hover:opacity-90 disabled:opacity-50"
            disabled={readOnly}
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => navigate("/doctor-appointments")}
            className="px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default DocAppointmentEdit;

import React, { useContext, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { useNavigate } from "react-router-dom";

const DocAppointmentCreate = () => {
  const { createAppointment } = useContext(DoctorContext);
  const [userEmail, setUserEmail] = useState("");
  const [slotDate, setSlotDate] = useState(""); // Keep consistent with your patient booking format
  const [slotTime, setSlotTime] = useState("");
  const [amount, setAmount] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      userEmail,
      slotDate,
      slotTime,
    };
    if (amount !== "") payload.amount = Number(amount);
    const ok = await createAppointment(payload);
    if (ok) navigate("/doctor-appointments");
  };

  return (
    <div className="p-4 md:p-6 w-full">
      <h2 className="text-xl md:text-2xl font-semibold mb-4">
        Create Appointment
      </h2>
      <form
        onSubmit={onSubmit}
        className="bg-white rounded border p-4 space-y-3 max-w-lg"
      >
        <div>
          <label className="text-sm">User Email (must exist)</label>
          <input
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            className="w-full border rounded p-2 mt-1"
            required
          />
        </div>
        <div>
          <label className="text-sm">Slot Date</label>
          <input
            type="text"
            placeholder="YYYY-MM-DD (match patient booking format)"
            value={slotDate}
            onChange={(e) => setSlotDate(e.target.value)}
            className="w-full border rounded p-2 mt-1"
            required
          />
        </div>
        <div>
          <label className="text-sm">Slot Time</label>
          <input
            type="text"
            placeholder="e.g. 11:00 AM"
            value={slotTime}
            onChange={(e) => setSlotTime(e.target.value)}
            className="w-full border rounded p-2 mt-1"
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
            placeholder="Leave blank to use doctor's default fee"
          />
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 rounded bg-primary text-white hover:opacity-90">
            Create
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

export default DocAppointmentCreate;

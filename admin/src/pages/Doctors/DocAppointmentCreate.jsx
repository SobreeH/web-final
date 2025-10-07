import React, { useContext, useState, useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { useNavigate } from "react-router-dom";

const DocAppointmentCreate = () => {
  const { createAppointment, myAppointments, getMyAppointments } =
    useContext(DoctorContext);

  const [userEmail, setUserEmail] = useState("");

  // --- Date dropdowns (DD-MM-YYYY) ---
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  // --- Time selection (same logic style as frontend Appointment.jsx) ---
  const [timeOptions, setTimeOptions] = useState([]); // available times for selected date
  const [slotTime, setSlotTime] = useState("");

  const [amount, setAmount] = useState("");
  const navigate = useNavigate();

  const pad2 = (n) => String(n).padStart(2, "0");

  const now = new Date();
  const currentYear = now.getFullYear();
  const years = [currentYear, currentYear + 1, currentYear + 2];

  const getDaysInMonth = (m, y) => {
    const mm = Number(m || 1); // 1-12
    const yy = Number(y || currentYear);
    return new Date(yy, mm, 0).getDate(); // last day of month
  };

  const maxDays = getDaysInMonth(month, year);
  const days = Array.from({ length: maxDays }, (_, i) => pad2(i + 1));
  const months = Array.from({ length: 12 }, (_, i) => pad2(i + 1));

  // Normalize "D-M-YYYY" vs "DD-MM-YYYY" to compare logically
  const sameDateStr = (a, b) => {
    if (!a || !b) return false;
    const [ad, am, ay] = String(a)
      .split("-")
      .map((x) => Number(x));
    const [bd, bm, by] = String(b)
      .split("-")
      .map((x) => Number(x));
    return ad === bd && am === bm && ay === by;
  };

  const composeSelectedDate = () => {
    if (!day || !month || !year) return "";
    return `${day}-${month}-${year}`; // DD-MM-YYYY (padded)
  };

  const selectedDateObj = () => {
    if (!day || !month || !year) return null;
    return new Date(Number(year), Number(month) - 1, Number(day));
  };

  // Build time options for selected date (10:00 to 21:00, 30-min steps),
  // excluding doctor's already-booked slots for that date (from myAppointments).
  const buildTimeOptions = () => {
    const dateObj = selectedDateObj();
    if (!dateObj) {
      setTimeOptions([]);
      return;
    }

    // Start and end bounds for the chosen day
    const start = new Date(dateObj);
    const end = new Date(dateObj);
    end.setHours(21, 0, 0, 0);

    const today = new Date();
    if (dateObj.toDateString() === today.toDateString()) {
      // Same-day rule (mirror frontend Appointment.jsx behavior):
      // if now > 10:00, start from next hour; minutes rounded to 0 or 30
      start.setHours(start.getHours() > 10 ? start.getHours() + 1 : 10);
      start.setMinutes(start.getMinutes() > 30 ? 30 : 0);
    } else {
      // Future day: start 10:00
      start.setHours(10, 0, 0, 0);
    }

    // Gather booked times for this doctor on the selected date from myAppointments
    const selectedDateStr = composeSelectedDate(); // DD-MM-YYYY
    const bookedTimes = new Set(
      (myAppointments || [])
        .filter((a) => sameDateStr(a.slotDate, selectedDateStr) && !a.cancelled)
        .map((a) => a.slotTime)
    );

    const options = [];
    const cursor = new Date(start);

    while (cursor < end) {
      const formatted = cursor.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }); // matches frontend formatting approach

      if (!bookedTimes.has(formatted)) {
        options.push(formatted);
      }

      cursor.setMinutes(cursor.getMinutes() + 30);
    }

    setTimeOptions(options);
  };

  // Ensure we have the doctor's current appointments to derive booked times
  useEffect(() => {
    getMyAppointments?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recompute time options whenever selected date or appointment list changes
  useEffect(() => {
    setSlotTime(""); // reset chosen time if date changes
    buildTimeOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day, month, year, myAppointments]);

  // If selected day becomes invalid after month/year changes, clear it
  useEffect(() => {
    if (day && Number(day) > maxDays) {
      setDay("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year, maxDays]);

  const onSubmit = async (e) => {
    e.preventDefault();

    // Compose DD-MM-YYYY
    const slotDate = composeSelectedDate();
    if (!slotDate || !slotTime) {
      // simple guard (keep minimal)
      return;
    }

    const payload = {
      userEmail,
      slotDate, // DD-MM-YYYY (single source of truth)
      slotTime, // chosen from generated options
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

        {/* Slot Date: DD-MM-YYYY via dropdowns */}
        <div>
          <label className="text-sm">Slot Date (DD‑MM‑YYYY)</label>
          <div className="mt-1 flex gap-2">
            {/* Day */}
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="border rounded p-2 w-1/3"
              required
            >
              <option value="">Day</option>
              {days.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* Month */}
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="border rounded p-2 w-1/3"
              required
            >
              <option value="">Month</option>
              {months.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            {/* Year */}
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="border rounded p-2 w-1/3"
              required
            >
              <option value="">Year</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Slot Time: chips generated like in Appointment.jsx */}
        <div>
          <label className="text-sm">Slot Time</label>
          <div className="flex items-center gap-3 w-full overflow-x-auto mt-2">
            {timeOptions.length === 0 ? (
              <span className="text-sm text-gray-500">
                {day && month && year
                  ? "No available times for the selected date."
                  : "Select a date to see available times."}
              </span>
            ) : (
              timeOptions.map((t) => (
                <p
                  key={t}
                  onClick={() => setSlotTime(t)}
                  className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${
                    t === slotTime
                      ? "bg-blue-500 text-white"
                      : "text-grey-400 border border-gray-300"
                  }`}
                >
                  {t.toLowerCase()}
                </p>
              ))
            )}
          </div>
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
          <button
            className="px-3 py-1.5 rounded bg-primary text-white hover:opacity-90"
            disabled={!day || !month || !year || !slotTime}
            title={
              !day || !month || !year || !slotTime
                ? "Select date and time"
                : undefined
            }
          >
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

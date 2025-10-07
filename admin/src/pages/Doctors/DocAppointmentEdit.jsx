import React, { useContext, useEffect, useMemo, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { useNavigate, useParams } from "react-router-dom";

const DocAppointmentEdit = () => {
  const { id } = useParams();
  const { myAppointments, getMyAppointments, updateAppointment } =
    useContext(DoctorContext);
  const navigate = useNavigate();

  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const [timeOptions, setTimeOptions] = useState([]);
  const [slotTime, setSlotTime] = useState("");
  const [amount, setAmount] = useState("");

  const pad2 = (n) => String(n).padStart(2, "0");

  const now = new Date();
  const currentYear = now.getFullYear();
  const years = [currentYear, currentYear + 1, currentYear + 2];

  const getDaysInMonth = (m, y) => {
    const mm = Number(m || 1);
    const yy = Number(y || currentYear);
    return new Date(yy, mm, 0).getDate();
  };

  const maxDays = getDaysInMonth(month, year);
  const days = Array.from({ length: maxDays }, (_, i) => pad2(i + 1));
  const months = Array.from({ length: 12 }, (_, i) => pad2(i + 1));

  const appt = useMemo(
    () => myAppointments.find((a) => a._id === id),
    [myAppointments, id]
  );

  useEffect(() => {
    (async () => {
      if (!appt) {
        await getMyAppointments?.();
      }
    })();
  }, [id]);

  useEffect(() => {
    if (appt) {
      const [d, m, y] = String(appt.slotDate || "")
        .split("-")
        .map((x) => Number(x));
      if (d && m && y) {
        setDay(pad2(d));
        setMonth(pad2(m));
        setYear(String(y));
      }
      setSlotTime(appt.slotTime || "");
      setAmount(appt.amount ?? "");
    }
  }, [appt]);

  useEffect(() => {
    if (day && Number(day) > maxDays) setDay("");
  }, [month, year, maxDays]);

  const readOnly = !!(appt && (appt.cancelled || appt.isCompleted));

  const composeSelectedDate = () => {
    if (!day || !month || !year) return "";
    return `${day}-${month}-${year}`;
  };

  const selectedDateObj = () => {
    if (!day || !month || !year) return null;
    return new Date(Number(year), Number(month) - 1, Number(day));
  };

  const normalizeToDDMMYYYY = (s) => {
    if (!s) return "";
    const [d, m, y] = s.split("-").map((x) => Number(x));
    if (!d || !m || !y) return "";
    return `${pad2(d)}-${pad2(m)}-${y}`;
  };

  const sameDateStr = (a, b) => {
    const na = normalizeToDDMMYYYY(String(a || ""));
    const nb = normalizeToDDMMYYYY(String(b || ""));
    return na && nb && na === nb;
  };

  const buildTimeOptions = () => {
    const dateObj = selectedDateObj();
    if (!appt || !dateObj) {
      setTimeOptions([]);
      return;
    }

    const start = new Date(dateObj);
    const end = new Date(dateObj);
    end.setHours(21, 0, 0, 0);

    const today = new Date();
    if (dateObj.toDateString() === today.toDateString()) {
      start.setHours(start.getHours() > 10 ? start.getHours() + 1 : 10);
      start.setMinutes(start.getMinutes() > 30 ? 30 : 0);
    } else {
      start.setHours(10, 0, 0, 0);
    }

    const targetDateStr = composeSelectedDate();
    const bookedTimes = new Set(
      (myAppointments || [])
        .filter(
          (a) =>
            String(a.docId) === String(appt.docId) &&
            !a.cancelled &&
            a._id !== appt._id &&
            sameDateStr(a.slotDate, targetDateStr)
        )
        .map((a) => a.slotTime)
    );

    const opts = [];
    const cursor = new Date(start);
    while (cursor < end) {
      const formatted = cursor.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      if (!bookedTimes.has(formatted)) {
        opts.push(formatted);
      }
      cursor.setMinutes(cursor.getMinutes() + 30);
    }

    setTimeOptions(opts);
  };

  useEffect(() => {
    buildTimeOptions();
  }, [day, month, year, myAppointments]);

  useEffect(() => {
    if (timeOptions.length && slotTime && !timeOptions.includes(slotTime)) {
      setSlotTime("");
    }
  }, [timeOptions]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!appt) return;

    const payload = {};

    const composedDate = composeSelectedDate();
    const apptDateNorm = normalizeToDDMMYYYY(appt.slotDate);
    if (composedDate && composedDate !== apptDateNorm) {
      payload.slotDate = composedDate;
    }

    if (slotTime && slotTime !== appt.slotTime) {
      payload.slotTime = slotTime;
    }

    if (amount !== "" && Number(amount) !== appt.amount) {
      payload.amount = Number(amount);
    }

    const ok = await updateAppointment(id, payload);
    if (ok) navigate("/doctor-appointments");
  };

  if (!appt) {
    return (
      <div className="p-4 md:p-6 w-full">
        <div className="text-gray-500">Loading appointment…</div>
      </div>
    );
  }

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
          <label className="text-sm">Slot Date (DD‑MM‑YYYY)</label>
          <div className="mt-1 flex gap-2">
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="border rounded p-2 w-1/3"
              disabled={readOnly}
              required
            >
              <option value="">Day</option>
              {days.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="border rounded p-2 w-1/3"
              disabled={readOnly}
              required
            >
              <option value="">Month</option>
              {months.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="border rounded p-2 w-1/3"
              disabled={readOnly}
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
                  onClick={() => !readOnly && setSlotTime(t)}
                  className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${
                    t === slotTime
                      ? "bg-blue-500 text-white"
                      : "text-grey-400 border border-gray-300"
                  } ${readOnly ? "opacity-60 cursor-not-allowed" : ""}`}
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

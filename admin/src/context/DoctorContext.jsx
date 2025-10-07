// admin/src/context/DoctorContext.jsx
import axios from "axios";
import { useState, createContext } from "react";
import { toast } from "react-toastify";

export const DoctorContext = createContext();

const DoctorContextProvider = (props) => {
  const [dToken, setDToken] = useState(
    localStorage.getItem("dToken") ? localStorage.getItem("dToken") : ""
  );
  const [myAppointments, setMyAppointments] = useState([]);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Auth
  const doctorLogin = async ({ email, password }) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/doctor/login`, {
        email,
        password,
      });
      if (data?.success) {
        localStorage.setItem("dToken", data.token);
        setDToken(data.token);
        toast.success("Doctor login successful!");
        return true;
      }
      toast.error(data?.message || "Login failed");
      return false;
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
      return false;
    }
  };

  const doctorLogout = () => {
    if (dToken) {
      localStorage.removeItem("dToken");
      setDToken("");
      toast.success("Logged out");
    }
  };

  // Appointments
  const getMyAppointments = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/doctor/appointments`,
        {
          headers: { dToken },
        }
      );
      if (data?.success) {
        setMyAppointments(
          Array.isArray(data.appointments) ? data.appointments : []
        );
      } else {
        toast.error(data?.message || "Failed to fetch appointments");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    }
  };

  // require existing user by email; amount optional
  const createAppointment = async ({
    userEmail,
    slotDate,
    slotTime,
    amount,
  }) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/doctor/appointment`,
        { userEmail, slotDate, slotTime, amount },
        { headers: { dToken } }
      );
      if (data?.success) {
        toast.success(data?.message || "Appointment created");
        await getMyAppointments();
        return true;
      }
      toast.error(data?.message || "Failed to create appointment");
      return false;
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
      return false;
    }
  };

  const updateAppointment = async (id, { slotDate, slotTime, amount }) => {
    try {
      const payload = {};
      if (slotDate !== undefined) payload.slotDate = slotDate;
      if (slotTime !== undefined) payload.slotTime = slotTime;
      if (amount !== undefined) payload.amount = amount;

      const { data } = await axios.put(
        `${backendUrl}/api/doctor/appointment/${id}`,
        payload,
        { headers: { dToken } }
      );
      if (data?.success) {
        toast.success(data?.message || "Appointment updated");
        await getMyAppointments();
        return true;
      }
      toast.error(data?.message || "Failed to update appointment");
      return false;
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
      return false;
    }
  };

  const deleteAppointment = async (id) => {
    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/doctor/appointment/${id}`,
        { headers: { dToken } }
      );
      if (data?.success) {
        toast.success(data?.message || "Appointment deleted");
        setMyAppointments((prev) => prev.filter((a) => a._id !== id));
        return true;
      }
      toast.error(data?.message || "Failed to delete appointment");
      return false;
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
      return false;
    }
  };

  const completeAppointment = async (id) => {
    try {
      const { data } = await axios.patch(
        `${backendUrl}/api/doctor/appointment/${id}/complete`,
        {},
        { headers: { dToken } }
      );
      if (data?.success) {
        toast.success(data?.message || "Appointment completed");
        await getMyAppointments();
        return true;
      }
      toast.error(data?.message || "Failed to complete appointment");
      return false;
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
      return false;
    }
  };

  const value = {
    backendUrl,
    dToken,
    setDToken,

    // auth
    doctorLogin,
    doctorLogout,

    // appts
    myAppointments,
    getMyAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    completeAppointment,
  };

  return (
    <DoctorContext.Provider value={value}>
      {props.children}
    </DoctorContext.Provider>
  );
};

export default DoctorContextProvider;

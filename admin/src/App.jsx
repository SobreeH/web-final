import React, { useContext } from "react";
import Login from "./pages/Login";
import { ToastContainer } from "react-toastify";
import { AdminContext } from "./context/AdminContext";
import { DoctorContext } from "./context/DoctorContext";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Admin/Dashboard";
import AllApointments from "./pages/Admin/AllApointments";
import AddDoctor from "./pages/Admin/AddDoctor";
import DoctorsList from "./pages/Admin/DoctorsList";
import Users from "./pages/Admin/Users";

// Doctor pages
import DocDashboard from "./pages/Doctors/DocDashboard";
import DocAppointments from "./pages/Doctors/DocAppointments";
import DocAppointmentCreate from "./pages/Doctors/DocAppointmentCreate";
import DocAppointmentEdit from "./pages/Doctors/DocAppointmentEdit";

const App = () => {
  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);

  if (aToken) {
    // Admin layout
    return (
      <div className="bg-[#f8f9fd]">
        {" "}
        <ToastContainer /> <Navbar />{" "}
        <div className="flex items-start">
          {" "}
          <Sidebar />{" "}
          <Routes>
            <Route path="/" element={<></>} />
            <Route path="/admin-dashboard" element={<Dashboard />} />
            <Route path="/all-appointments" element={<AllApointments />} />
            <Route path="/add-doctor" element={<AddDoctor />} />
            <Route path="/doctor-list" element={<DoctorsList />} />
            <Route path="/users" element={<Users />} />{" "}
          </Routes>{" "}
        </div>{" "}
      </div>
    );
  }

  if (dToken) {
    // Doctor layout
    return (
      <div className="bg-[#f8f9fd]">
        {" "}
        <ToastContainer /> <Navbar />{" "}
        <div className="flex items-start">
          {" "}
          <Sidebar />{" "}
          <Routes>
            <Route path="/" element={<></>} />
            <Route path="/doctor-dashboard" element={<DocDashboard />} />
            <Route path="/doctor-appointments" element={<DocAppointments />} />
            <Route
              path="/doctor-appointments/create"
              element={<DocAppointmentCreate />}
            />
            <Route
              path="/doctor-appointments/:id/edit"
              element={<DocAppointmentEdit />}
            />{" "}
          </Routes>{" "}
        </div>{" "}
      </div>
    );
  }

  // No tokens -> Login
  return (
    <>
      {" "}
      <Login /> <ToastContainer />
    </>
  );
};

export default App;

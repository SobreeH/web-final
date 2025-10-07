import React, { useContext } from "react";
import { AdminContext } from "../context/AdminContext";
import { DoctorContext } from "../context/DoctorContext";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets";

const Sidebar = () => {
  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);

  return (
    <div className="min-h-screen bg-white border-r">
      {aToken && (
        <ul>
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-gray-50 border-r-4 border-primary" : ""
              }`
            }
            to={"/admin-dashboard"}
          >
            <img src={assets.home_icon} alt="" />
            <p>Dashboard</p>
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-gray-50 border-r-4 border-primary" : ""
              }`
            }
            to={"/all-appointments"}
          >
            <img src={assets.appointment_icon} alt="" />
            <p>Appointment</p>
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-gray-50 border-r-4 border-primary" : ""
              }`
            }
            to={"/add-doctor"}
          >
            <img src={assets.add_icon} alt="" />
            <p>Add Doctor</p>
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-gray-50 border-r-4 border-primary" : ""
              }`
            }
            to={"/doctor-list"}
          >
            <img src={assets.people_icon} alt="" />
            <p>Doctors List</p>
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-gray-50 border-r-4 border-primary" : ""
              }`
            }
            to={"/users"}
          >
            <img src={assets.people_icon} alt="" />
            <p className="hidden md:block">Users</p>
          </NavLink>
        </ul>
      )}

      {!aToken && dToken && (
        <ul>
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-gray-50 border-r-4 border-primary" : ""
              }`
            }
            to={"/doctor-dashboard"}
          >
            <img src={assets.home_icon} alt="" />
            <p>Doctor Dashboard</p>
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-gray-50 border-r-4 border-primary" : ""
              }`
            }
            to={"/doctor-appointments"}
          >
            <img src={assets.appointment_icon} alt="" />
            <p>My Appointments</p>
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-gray-50 border-r-4 border-primary" : ""
              }`
            }
            to={"/doctor-appointments/create"}
          >
            <img src={assets.add_icon} alt="" />
            <p>Create Appointment</p>
          </NavLink>
        </ul>
      )}
    </div>
  );
};

export default Sidebar;

import axios from "axios";
import { useState } from "react";
import { createContext } from "react";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
  const [aToken, setAToken] = useState(
    localStorage.getItem("aToken") ? localStorage.getItem("aToken") : ""
  );
  const [doctors, setDoctors] = useState([]);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const getAllDoctors = async () => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/all-doctors",
        {},
        { headers: { aToken } }
      );
      if (data.success) {
        setDoctors(data.doctors);
        console.log(data.doctors);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const changeAvailability = async (docId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/change-availability",
        { docId },
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        getAllDoctors();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteDoctor = async (docId) => {
    try {
      // Preferred: DELETE /doctor/:id
      const delRes = await axios.delete(
        backendUrl + `/api/admin/doctor/${docId}`,
        { headers: { aToken } }
      );

      if (delRes.data?.success) {
        toast.success(delRes.data?.message || "Doctor deleted");
        getAllDoctors();
        return;
      }

      // If API returned success:false, handle guard or fallback
      if (delRes.data?.code === "DOCTOR_HAS_ACTIVE_APPOINTMENTS") {
        toast.error("Cannot delete: doctor has active appointments.");
        return;
      }

      // Fallback: POST /delete-doctor { id }
      const fbRes = await axios.post(
        backendUrl + "/api/admin/delete-doctor",
        { id: docId },
        { headers: { aToken } }
      );

      if (fbRes.data?.success) {
        toast.success(fbRes.data?.message || "Doctor deleted");
        getAllDoctors();
      } else {
        if (fbRes.data?.code === "DOCTOR_HAS_ACTIVE_APPOINTMENTS") {
          toast.error("Cannot delete: doctor has active appointments.");
        } else {
          toast.error(fbRes.data?.message || "Failed to delete doctor");
        }
      }
    } catch (err) {
      const code = err?.response?.data?.code;
      const message = err?.response?.data?.message || err.message;
      if (code === "DOCTOR_HAS_ACTIVE_APPOINTMENTS") {
        toast.error("Cannot delete: doctor has active appointments.");
      } else {
        toast.error(message);
      }
    }
  };
  const [users, setUsers] = useState([]);

  // ===== Users CRUD (Admin) =====
  const getAllUsers = async () => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/all-users",
        {},
        { headers: { aToken } }
      );
      if (data?.success) {
        setUsers(data.users || []);
      } else {
        toast.error(data?.message || "Failed to fetch users");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const createUser = async ({ name, email, password }) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/user",
        { name, email, password },
        { headers: { aToken } }
      );
      if (data?.success) {
        toast.success(data?.message || "User created");
        await getAllUsers();
        return true;
      } else {
        toast.error(data?.message || "Failed to create user");
        return false;
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
      return false;
    }
  };

  const updateUser = async (id, { name, email, password }) => {
    try {
      const payload = {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
      };
      // password optional; send only if not blank
      if (password !== undefined && password !== "")
        payload.password = password;

      const { data } = await axios.put(
        backendUrl + `/api/admin/user/${id}`,
        payload,
        { headers: { aToken } }
      );
      if (data?.success) {
        toast.success(data?.message || "User updated");
        await getAllUsers();
        return true;
      } else {
        toast.error(data?.message || "Failed to update user");
        return false;
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
      return false;
    }
  };

  const deleteUser = async (id) => {
    try {
      const { data } = await axios.delete(
        backendUrl + `/api/admin/user/${id}`,
        { headers: { aToken } }
      );
      if (data?.success) {
        toast.success(data?.message || "User deleted");
        setUsers((prev) => prev.filter((u) => u._id !== id));
        return true;
      } else {
        toast.error(data?.message || "Failed to delete user");
        return false;
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
      return false;
    }
  };

  const value = {
    aToken,
    setAToken,
    backendUrl,
    doctors,
    getAllDoctors,
    changeAvailability,
    deleteDoctor,
    users,
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
  };

  return (
    <AdminContext.Provider value={value}>
      {props.children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;

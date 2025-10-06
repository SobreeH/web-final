import React, { createContext, useEffect, useState } from "react";

import axios from "axios";
import { toast } from "react-toastify";
export const AppContext = createContext();

const AppContextProvider = (props) => {
  const currencySymbol = "฿";
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [doctors, setDoctors] = useState([]);
  const [token, setToken] = useState(
    localStorage.getItem("token") ? localStorage.getItem("token") : false
  );
  const [userData, setUserData] = useState(false);

  const getDoctorsData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/doctor/list");
      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error(data.message || "Failed to load doctors");
      }
    } catch (error) {
      console.error("getDoctorsData error:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to load doctors"
      );
    }
  };

  const loadUserProfileData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/get-profile", {
        headers: { token },
      });
      if (data.success) {
        setUserData(data.userData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("getDoctorsData error:", error);

      toast.error(error.message);
    }
  };
  // to show doctors
  useEffect(() => {
    getDoctorsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    doctors,
    currencySymbol,
    getDoctorsData,
    token,
    setToken,
    backendUrl,
    userData,
    setUserData,
    loadUserProfileData,
  };

  // to get user data

  useEffect(() => {
    if (token) {
      loadUserProfileData();
    } else {
      setUserData(false);
    }
  }, [token]);

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;

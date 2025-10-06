import React, { createContext, useEffect, useState } from "react";

import axios from "axios";
import { toast } from "react-toastify";
export const AppContext = createContext();

const AppContextProvider = (props) => {
  const currencySymbol = "฿";
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [doctors, SetDoctors] = useState([]);

  const value = {
    doctors,
    currencySymbol,
  };

  const getDoctorsData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/doctor/list");
      if (data.success) {
        SetDoctors(data.doctors);
      }

      useEffect(() => {
        getDoctorsData();
      }, []);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;

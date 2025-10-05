import React from "react";
import { useContext } from "react";
import { AdminContext } from "../../context/AdminContext";
import { useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const DoctorsList = () => {
  const { doctors, aToken, getAllDoctors, backendUrl } =
    useContext(AdminContext);

  useEffect(
    (aToken) => {
      getAllDoctors();
    },
    [aToken]
  );

  return (
    <div className="m-5 max-h-[90vh] overflow-y-scroll">
      <h1 className="text-lg font-medium">All Doctors</h1>
      <div className="w-full flex flex-wrap gap-4 pt-5 gap-y-6">
        {doctors.map((item, index) => (
          <div
            className="border border-blue-200 rounded-xl max-w-56 overflow-hidden cursor-pointer group"
            key={index}
          >
            <img
              className="bg-blue-50 group-hover:bg-primary transition-all duration-500"
              src={item.image}
              alt=""
            />
            <div>
              <p>{item.name}</p>
              <p> {item.speciality} </p>
              <div className="flex items-center gap-2 p-2">
                <input
                  onChange={async () => {
                    try {
                      const { data } = await axios.post(
                        backendUrl + "/api/admin/change-availability",
                        { docId: item._id },
                        {
                          headers: {
                            Authorization: `Bearer ${aToken}`,
                          },
                        }
                      );
                      if (data.success) {
                        toast.success(data.message);
                        getAllDoctors();
                      } else {
                        toast.error(data.message);
                      }
                    } catch (error) {
                      toast.error(
                        error.response?.data?.message ||
                          "Error changing availability"
                      );
                    }
                  }}
                  type="checkbox"
                  checked={item.available}
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
                <p>Available</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorsList;

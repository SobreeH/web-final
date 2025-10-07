import React, { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { AdminContext } from "../../context/AdminContext";
const DoctorsList = () => {
  const {
    doctors,
    aToken,
    getAllDoctors,
    backendUrl,
    changeAvailability,
    deleteDoctor,
  } = useContext(AdminContext);

  useEffect(() => {
    getAllDoctors();
  }, [aToken]);

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
                  onChange={() => changeAvailability(item._id)}
                  type="checkbox"
                  checked={item.available}
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
                <p>Available</p>

                <Link
                  to={`/doctors/${item._id}/edit`}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Edit
                </Link>
              </div>
              <div>
                <button
                  onClick={() => {
                    if (window.confirm("Delete this doctor permanently?")) {
                      deleteDoctor(item._id);
                    }
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorsList;

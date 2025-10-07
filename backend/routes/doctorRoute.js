import express from "express";
import {
  doctorList,
  ChangeAvailability,
  loginDoctor,
  listMyAppointments,
  createAppointmentByDoctor,
  updateAppointmentByDoctor,
  deleteAppointmentByDoctor,
  completeAppointmentByDoctor,
  listUsersForDoctors,
} from "../controllers/doctorController.js";
import authDoctor from "../middlewares/authDoctor.js";

const doctorRouter = express.Router();

// Public route
doctorRouter.get("/list", doctorList);
doctorRouter.post("/login", loginDoctor);

// Docter auth routes

doctorRouter.post("/change-availability", authDoctor, ChangeAvailability);
doctorRouter.get("/appointments", authDoctor, listMyAppointments);
doctorRouter.post("/appointment", authDoctor, createAppointmentByDoctor);
doctorRouter.put("/appointment/:id", authDoctor, updateAppointmentByDoctor);
doctorRouter.delete("/appointment/:id", authDoctor, deleteAppointmentByDoctor);
doctorRouter.patch(
  "/appointment/:id/complete",
  authDoctor,
  completeAppointmentByDoctor
);

doctorRouter.get("/users", authDoctor, listUsersForDoctors);

export default doctorRouter;

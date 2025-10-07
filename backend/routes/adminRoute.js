import express from "express";
import {
  loginAdmin,
  allDoctors,
  addDoctor,
  deleteDoctor,
  allAppointments,
  deleteAppointment,
  allUsers,
  createUserAdmin,
  updateUserAdmin,
  deleteUserAdmin,
  dashboardStats,
} from "../controllers/adminController.js";
import upload from "../middlewares/multer.js";
import authAdmin from "../middlewares/authAdmin.js";
import { ChangeAvailability } from "../controllers/doctorController.js";

const adminRouter = express.Router();

adminRouter.post("/add-doctor", authAdmin, upload.single("image"), addDoctor);
adminRouter.post("/login", loginAdmin);
adminRouter.post("/all-doctors", authAdmin, allDoctors);
adminRouter.post("/change-availability", authAdmin, ChangeAvailability);

// RESTful delete
adminRouter.delete("/doctor/:id", authAdmin, deleteDoctor);

// Optional POST fallback if your frontend prefers POST
adminRouter.post("/delete-doctor", authAdmin, (req, res) => {
  req.params.id = req.body.id;
  return deleteDoctor(req, res);
});

// List all appointments (admin-only) - follows your POST list style
adminRouter.post("/all-appointments", authAdmin, allAppointments);
// Dashboard statistics for admin panel
adminRouter.post("/dashboard-stats", authAdmin, dashboardStats);

// Hard delete an appointment by ID (admin-only)
adminRouter.delete("/appointment/:id", authAdmin, deleteAppointment);

// Users management (admin-only)
adminRouter.post("/all-users", authAdmin, allUsers);
adminRouter.post("/user", authAdmin, createUserAdmin);
adminRouter.put("/user/:id", authAdmin, updateUserAdmin);
// RESTful delete user
adminRouter.delete("/user/:id", authAdmin, deleteUserAdmin);

// Optional POST fallback for deletion if frontend cannot send DELETE
adminRouter.post("/delete-user", authAdmin, (req, res) => {
  req.params.id = req.body.id;
  return deleteUserAdmin(req, res);
});

export default adminRouter;

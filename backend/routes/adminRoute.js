import express from "express";
import {
  addDoctor,
  allDoctors,
  loginAdmin,
  deleteDoctor,
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

export default adminRouter;

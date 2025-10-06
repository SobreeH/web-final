import express from "express";
import {
  createPaymentIntent,
  confirmPayment,
} from "../controllers/paymentController.js";
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
} from "../controllers/userController.js";
import authUser from "../middlewares/authUser.js";
import upload from "../middlewares/multer.js";

const userRouter = express.Router();

// login authen route
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

// user profile route
userRouter.get("/get-profile", authUser, getProfile);
userRouter.post(
  "/update-profile",
  upload.single("image"),
  authUser,
  updateProfile
);
userRouter.post("/book-appointment", authUser, bookAppointment);
userRouter.get("/appointments", authUser, listAppointment);
userRouter.post("/cancel-appointment", authUser, cancelAppointment);

// payment routes
userRouter.post("/create-payment-intent", authUser, createPaymentIntent);
userRouter.post("/confirm-payment", authUser, confirmPayment);

export default userRouter;

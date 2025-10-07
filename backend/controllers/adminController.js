// backend/controllers/adminController.js

import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";

// API to add new doctor by admin
const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
    } = req.body;
    const imageFile = req.file;

    // checking for data to add doctor
    if (
      !name ||
      !email ||
      !password ||
      !speciality ||
      !degree ||
      !experience ||
      !about ||
      !fees ||
      !address
    ) {
      return res.json({ success: false, message: "Missing Details" });
    }

    // validating email format
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: " Enter valid email " });
    }

    // validating password length
    if (password.length < 8) {
      return res.json({
        success: false,
        message: " Password must have at least 8 characters/Numbers ",
      });
    }

    // hashing doctor password
    const salt = await bcrypt.genSalt(5);
    const hasedPassword = await bcrypt.hash(password, salt);

    // upload image to cloudinary
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });
    const imageUrl = imageUpload.secure_url;

    const doctorData = {
      name,
      email,
      image: imageUrl,
      password: hasedPassword,
      speciality,
      degree,
      experience,
      about,
      fees,
      address: JSON.parse(address),
      date: Date.now(),
    };

    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();

    res.json({ success: true, message: "Doctor Added" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//  API to update an existing doctor by ID (admin only)
const updateDoctorById = async (req, res) => {
  try {
    const { doctorId } = req.params;

    // Validate doctor ID
    if (!doctorId || !mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.json({ success: false, message: "Invalid doctor ID" });
    }

    // Ensure the doctor exists
    const existing = await doctorModel.findById(doctorId);
    if (!existing) {
      return res.json({ success: false, message: "Doctor not found" });
    }

    // Collect allowed fields from body
    const {
      name,
      email,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
      password,
    } = req.body ?? {};

    const update = {};

    if (name !== undefined) update.name = name;
    if (email !== undefined) update.email = email;
    if (speciality !== undefined) update.speciality = speciality;
    if (degree !== undefined) update.degree = degree;
    if (experience !== undefined) update.experience = experience;
    if (about !== undefined) update.about = about;
    if (fees !== undefined && fees !== "") update.fees = Number(fees);

    if (address !== undefined) {
      try {
        const parsed =
          typeof address === "string" ? JSON.parse(address) : address;
        if (parsed && typeof parsed === "object") {
          update.address = parsed;
        } else {
          return res.json({
            success: false,
            message: "Invalid address format",
          });
        }
      } catch (e) {
        return res.json({ success: false, message: "Invalid address format" });
      }
    }

    //  Optional password update
    if (password !== undefined && password !== "") {
      if (String(password).length < 8) {
        return res.json({
          success: false,
          message: "Password must have at least 8 characters/Numbers",
        });
      }
      const salt = await bcrypt.genSalt(5);
      update.password = await bcrypt.hash(password, salt);
    }

    // Optional image replacement
    if (req.file) {
      const imageUpload = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "image",
      });
      update.image = imageUpload.secure_url;

      // Note: We don't have public_id stored, so we are not deleting old image.
      // If you later store public_id in the model, we can clean up previous image here.
    }

    await doctorModel.findByIdAndUpdate(doctorId, update, { new: true });

    return res.json({ success: true, message: "Doctor updated" });
  } catch (error) {
    console.log(error);
    if (error?.code === 11000) {
      // Duplicate key (likely email)
      return res.json({ success: false, message: "Email already in use" });
    }
    return res.json({ success: false, message: error.message });
  }
};

// API for admin login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all doctors list for admin panel
const allDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select("-password");
    res.json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// DELETE doctor by ID (with guard on active appointments)
const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params; // /doctor/:id

    if (!id) {
      return res.json({ success: false, message: "Doctor ID is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.json({ success: false, message: "Invalid doctor ID" });
    }

    const doctor = await doctorModel.findById(id);
    if (!doctor) {
      return res.json({ success: false, message: "Doctor not found" });
    }

    // Guard: prevent deletion if doctor has active appointments (not cancelled & not completed)
    const hasActiveAppointments = await appointmentModel.exists({
      docId: id, // appointmentModel stores docId as String
      cancelled: false,
      isCompleted: false,
    });

    if (hasActiveAppointments) {
      return res.json({
        success: false,
        code: "DOCTOR_HAS_ACTIVE_APPOINTMENTS",
        message:
          "Doctor cannot be deleted because there are active appointments. Please cancel/reassign those appointments first or archive the doctor.",
      });
    }

    // Optional: delete image from Cloudinary if you saved public_id
    if (doctor.image_public_id) {
      try {
        await cloudinary.uploader.destroy(doctor.image_public_id);
      } catch (e) {
        console.log("Cloudinary delete error:", e.message);
        // Continue even if Cloudinary cleanup fails
      }
    }

    await doctor.deleteOne();
    return res.json({ success: true, message: "Doctor deleted" });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// List all appointments (admin-only)
const allAppointments = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({}).sort({ date: -1 });
    return res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// Hard delete one appointment (admin-only), and release the doctor's slot if needed
const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.json({
        success: false,
        message: "Appointment ID is required",
      });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.json({ success: false, message: "Invalid appointment ID" });
    }

    const appt = await appointmentModel.findById(id);
    if (!appt) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    // If the appointment isn't cancelled, free the slot
    const { docId, slotDate, slotTime, cancelled } = appt;
    if (!cancelled && docId && slotDate && slotTime) {
      const doctor = await doctorModel.findById(docId);
      if (doctor && doctor.slots_booked && doctor.slots_booked[slotDate]) {
        const filtered = doctor.slots_booked[slotDate].filter(
          (t) => t !== slotTime
        );
        doctor.slots_booked[slotDate] = filtered;
        await doctor.save(); // persist updated slots_booked
      }
    }

    await appointmentModel.findByIdAndDelete(id);
    return res.json({ success: true, message: "Appointment deleted" });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// List all users (without passwords), newest first
const allUsers = async (req, res) => {
  try {
    const users = await userModel
      .find({})
      .select("-password")
      .sort({ _id: -1 });
    return res.json({ success: true, users });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// Create user (name, email, password)
const createUserAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body ?? {};
    if (!name || !email || !password) {
      return res.json({ success: false, message: "Missing details" });
    }
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Enter valid email" });
    }
    if (String(password).length < 8) {
      return res.json({
        success: false,
        message: "Password must have at least 8 characters/Numbers",
      });
    }

    // unique email
    const existed = await userModel.findOne({ email });
    if (existed) {
      return res.json({ success: false, message: "Email already in use" });
    }

    const salt = await bcrypt.genSalt(5);
    const hashed = await bcrypt.hash(password, salt);

    const newUser = new userModel({ name, email, password: hashed });
    const saved = await newUser.save();
    const safe = saved.toObject();
    delete safe.password;

    return res.json({ success: true, message: "User created", user: safe });
  } catch (error) {
    console.log(error);
    // handle duplicate key just in case
    if (error?.code === 11000) {
      return res.json({ success: false, message: "Email already in use" });
    }
    return res.json({ success: false, message: error.message });
  }
};

// Update user (name?, email?, password?) — password optional (blank/omitted = unchanged)
const updateUserAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.json({ success: false, message: "Invalid user ID" });
    }

    const { name, email, password } = req.body ?? {};
    const update = {};

    if (name !== undefined) update.name = name;
    if (email !== undefined) {
      if (!validator.isEmail(email)) {
        return res.json({ success: false, message: "Enter valid email" });
      }
      update.email = email;
    }

    if (password !== undefined && password !== "") {
      if (String(password).length < 8) {
        return res.json({
          success: false,
          message: "Password must have at least 8 characters/Numbers",
        });
      }
      const salt = await bcrypt.genSalt(5);
      update.password = await bcrypt.hash(password, salt);
    }

    const updated = await userModel.findByIdAndUpdate(id, update, {
      new: true,
    });
    if (!updated) {
      return res.json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, message: "User updated" });
  } catch (error) {
    console.log(error);
    if (error?.code === 11000) {
      return res.json({ success: false, message: "Email already in use" });
    }
    return res.json({ success: false, message: error.message });
  }
};

// Delete user (cascade delete appointments + release slots)
const deleteUserAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.json({ success: false, message: "Invalid user ID" });
    }

    const user = await userModel.findById(id);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Find all their appointments
    const appts = await appointmentModel.find({ userId: id });

    // For each appointment, if not cancelled, free doctor slot
    for (const appt of appts) {
      if (!appt.cancelled) {
        const { docId, slotDate, slotTime } = appt;
        if (docId && slotDate && slotTime) {
          try {
            const doctor = await doctorModel.findById(docId);
            if (
              doctor &&
              doctor.slots_booked &&
              doctor.slots_booked[slotDate]
            ) {
              doctor.slots_booked[slotDate] = doctor.slots_booked[
                slotDate
              ].filter((t) => t !== slotTime);
              await doctor.save();
            }
          } catch (e) {
            console.log("Slot release error (deleteUserAdmin):", e?.message);
          }
        }
      }
    }

    // Delete their appointments
    const delRes = await appointmentModel.deleteMany({ userId: id });

    // Delete the user
    await userModel.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: "User and appointments deleted",
      deletedAppointments: delRes?.deletedCount ?? appts.length,
    });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

const dashboardStats = async (req, res) => {
  try {
    // Totals
    const [totalUsers, totalDoctors, totalAppointments] = await Promise.all([
      userModel.countDocuments({}),
      doctorModel.countDocuments({}),
      appointmentModel.countDocuments({}),
    ]);

    // Revenue: only appointments that are completed
    const revenueAgg = await appointmentModel.aggregate([
      { $match: { isCompleted: true } },
      { $group: { _id: null, revenue: { $sum: "$amount" } } },
    ]);
    const revenue = revenueAgg[0]?.revenue ?? 0;

    // Breakdown:
    // - pending: not cancelled, not confirmed, not completed
    // - confirmed: confirmed true, not cancelled, not completed
    // - cancelled: cancelled true
    // - completed: isCompleted true
    const [pending, confirmed, cancelled, completed] = await Promise.all([
      appointmentModel.countDocuments({
        cancelled: false,
        confirmed: false,
        isCompleted: false,
      }),
      appointmentModel.countDocuments({
        cancelled: false,
        confirmed: true,
        isCompleted: false,
      }),
      appointmentModel.countDocuments({ cancelled: true }),
      appointmentModel.countDocuments({ isCompleted: true }),
    ]);

    // Today windows based on server local time
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    // bookedToday: created today (date is stored as Number ms)
    const bookedToday = await appointmentModel.countDocuments({
      date: { $gte: start.getTime(), $lte: end.getTime() },
    });

    // scheduledToday: slotDate equals today's YYYY-MM-DD (server local)
    const pad = (n) => String(n).padStart(2, "0");
    const todayStr = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(
      start.getDate()
    )}`;
    const scheduledToday = await appointmentModel.countDocuments({
      slotDate: todayStr,
    });

    // Recent appointments (5 newest by created timestamp)
    const recentAppointments = await appointmentModel
      .find({})
      .sort({ date: -1 })
      .limit(5);

    return res.json({
      success: true,
      cards: {
        totalUsers,
        totalDoctors,
        totalAppointments,
        revenue, // THB; frontend will format
      },
      breakdown: { pending, confirmed, cancelled, completed },
      today: { bookedToday, scheduledToday },
      recentAppointments,
    });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

export {
  addDoctor,
  updateDoctorById,
  loginAdmin,
  allDoctors,
  deleteDoctor,
  allAppointments,
  deleteAppointment,
  allUsers,
  createUserAdmin,
  updateUserAdmin,
  deleteUserAdmin,
  dashboardStats,
};

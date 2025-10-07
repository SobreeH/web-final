import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import appointmentModel from "../models/appointmentModel.js";

import mongoose from "mongoose";

// API for showing all appointment

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

/// API for adding doctor

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

export {
  addDoctor,
  loginAdmin,
  allDoctors,
  deleteDoctor,
  allAppointments,
  deleteAppointment,
};

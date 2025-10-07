import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import doctorModel from "../models/doctorModel.js";
import userModel from "../models/userModel.js";
import appointmentModel from "../models/appointmentModel.js";

const ChangeAvailability = async (req, res) => {
  try {
    const { docId } = req.body;

    const docData = await doctorModel.findById(docId);
    await doctorModel.findByIdAndUpdate(docId, {
      available: !docData.available,
    });
    res.json({ success: true, message: "Availability Changed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select(["-password", "-email"]);

    res.json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Doctor Authen

const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.json({ success: false, message: "Missing email or password" });
    }
    const doc = await doctorModel.findOne({ email });
    if (!doc) {
      return res.json({ success: false, message: "Doctor does not exist" });
    }
    const ok = await bcrypt.compare(password, doc.password);
    if (!ok) {
      return res.json({ success: false, message: "Invalid credentials" });
    }
    // Sign token with doctor id (like user token payload)
    const token = jwt.sign({ id: doc._id }, process.env.JWT_SECRET);
    return res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// Doctor Appointment managemnent

// List appointments for logged-in doctor
const listMyAppointments = async (req, res) => {
  try {
    const { docId } = req.body;
    const appts = await appointmentModel.find({ docId }).sort({ date: -1 });
    return res.json({ success: true, appointments: appts });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// Helper: reserve a slot
const reserveSlot = async (docId, slotDate, slotTime) => {
  const doc = await doctorModel.findById(docId);
  if (!doc?.available) {
    throw new Error("Doctor not available");
  }
  const slots = doc.slots_booked || {};
  if (!slots[slotDate]) slots[slotDate] = [];
  if (slots[slotDate].includes(slotTime)) {
    throw new Error("Slot not available");
  }
  slots[slotDate].push(slotTime);
  doc.slots_booked = slots;
  await doc.save();
};

// Helper: release a slot (if present)
const releaseSlot = async (docId, slotDate, slotTime) => {
  const doc = await doctorModel.findById(docId);
  if (!doc) return;
  const slots = doc.slots_booked || {};
  if (slots[slotDate]) {
    slots[slotDate] = slots[slotDate].filter((t) => t !== slotTime);
    doc.slots_booked = slots;
    await doc.save();
  }
};

// Create appointment (require existing user)
const createAppointmentByDoctor = async (req, res) => {
  try {
    const { docId, userEmail, userId, slotDate, slotTime, amount } =
      req.body || {};
    if (!slotDate || !slotTime) {
      return res.json({
        success: false,
        message: "slotDate and slotTime are required",
      });
    }
    // Resolve user
    let user = null;
    if (userEmail) {
      user = await userModel.findOne({ email: userEmail });
      if (!user)
        return res.json({ success: false, message: "User not found by email" });
    } else if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.json({ success: false, message: "Invalid userId" });
      }
      user = await userModel.findById(userId);
      if (!user)
        return res.json({ success: false, message: "User not found by id" });
    } else {
      return res.json({
        success: false,
        message: "Provide userEmail or userId",
      });
    }

    const docData = await doctorModel.findById(docId).select("-password");
    if (!docData)
      return res.json({ success: false, message: "Doctor not found" });

    // Reserve slot (throws if conflict)
    await reserveSlot(docId, slotDate, slotTime);

    // Build appointment data
    const safeDocData = docData.toObject();
    delete safeDocData.slots_booked;

    const userData = await userModel.findById(user._id).select("-password");

    const appointmentData = {
      userId: String(user._id),
      docId: String(docId),
      slotDate,
      slotTime,
      userData,
      docData: safeDocData,
      amount: typeof amount === "number" ? amount : docData.fees,
      date: Date.now(),
      cancelled: false,
      confirmed: false,
      isCompleted: false,
    };

    const newAppt = new appointmentModel(appointmentData);
    await newAppt.save();

    return res.json({
      success: true,
      message: "Appointment created",
      appointment: newAppt,
    });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// Update (reschedule / amount) — only if not cancelled & not completed
const updateAppointmentByDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { docId, slotDate, slotTime, amount } = req.body || {};
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.json({ success: false, message: "Invalid appointment ID" });
    }
    const appt = await appointmentModel.findById(id);
    if (!appt)
      return res.json({ success: false, message: "Appointment not found" });
    if (String(appt.docId) !== String(docId)) {
      return res.json({ success: false, message: "Unauthorized action" });
    }
    if (appt.cancelled || appt.isCompleted) {
      return res.json({
        success: false,
        message: "Cannot edit this appointment",
      });
    }

    const updates = {};
    // Reschedule?
    const reschedule =
      (slotDate && slotDate !== appt.slotDate) ||
      (slotTime && slotTime !== appt.slotTime);
    if (reschedule) {
      // free old, reserve new
      await releaseSlot(docId, appt.slotDate, appt.slotTime);
      await reserveSlot(
        docId,
        slotDate || appt.slotDate,
        slotTime || appt.slotTime
      );
      updates.slotDate = slotDate || appt.slotDate;
      updates.slotTime = slotTime || appt.slotTime;
    }
    if (typeof amount === "number") {
      updates.amount = amount;
    }

    await appointmentModel.findByIdAndUpdate(id, updates);
    return res.json({ success: true, message: "Appointment updated" });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// Delete — free slot if not cancelled
const deleteAppointmentByDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { docId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.json({ success: false, message: "Invalid appointment ID" });
    }
    const appt = await appointmentModel.findById(id);
    if (!appt)
      return res.json({ success: false, message: "Appointment not found" });
    if (String(appt.docId) !== String(docId)) {
      return res.json({ success: false, message: "Unauthorized action" });
    }
    if (!appt.cancelled) {
      await releaseSlot(docId, appt.slotDate, appt.slotTime);
    }
    await appointmentModel.findByIdAndDelete(id);
    return res.json({ success: true, message: "Appointment deleted" });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// Complete — disallow if cancelled; idempotent if already completed
const completeAppointmentByDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { docId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.json({ success: false, message: "Invalid appointment ID" });
    }
    const appt = await appointmentModel.findById(id);
    if (!appt)
      return res.json({ success: false, message: "Appointment not found" });
    if (String(appt.docId) !== String(docId)) {
      return res.json({ success: false, message: "Unauthorized action" });
    }
    if (appt.cancelled) {
      return res.json({
        success: false,
        message: "Cannot complete a cancelled appointment",
      });
    }
    if (appt.isCompleted) {
      return res.json({
        success: true,
        message: "Appointment already completed",
      });
    }
    await appointmentModel.findByIdAndUpdate(id, {
      isCompleted: true,
      confirmed: true,
    });
    return res.json({ success: true, message: "Appointment marked completed" });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

export {
  ChangeAvailability,
  doctorList,
  loginDoctor,
  listMyAppointments,
  createAppointmentByDoctor,
  updateAppointmentByDoctor,
  deleteAppointmentByDoctor,
  completeAppointmentByDoctor,
};

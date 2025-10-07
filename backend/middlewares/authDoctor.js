// backend/middlewares/authDoctor.js
import jwt from "jsonwebtoken";

// Doctor auth middleware
const authDoctor = async (req, res, next) => {
  try {
    const { dtoken } = req.headers; // Express lowercases header keys
    if (!dtoken) {
      return res.json({ success: false, message: "NOT DOCTOR, Login Again" });
    }
    const token_decode = jwt.verify(dtoken, process.env.JWT_SECRET);
    // Expect payload { id: <doctorId> }
    if (!token_decode?.id) {
      return res.json({ success: false, message: "Invalid token" });
    }
    req.body.docId = token_decode.id;
    next();
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export default authDoctor;

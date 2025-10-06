import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";

// API to register usr
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // all fields not missing
    if (!name || !password || !email) {
      return res.json({ success: false, message: "Missing Detials" });
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

    // hashing user password
    const salt = await bcrypt.genSalt(5);
    const hasedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hasedPassword,
    };

    const newUser = new userModel(userData);
    const user = await newUser.save();

    // get _id for token to login user

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API for usr login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User does not Exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid Credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get user profile profile data
const getProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    const userData = await userModel.findById(userId).select("-password");

    res.json({ success: true, userData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { registerUser, loginUser, getProfile };

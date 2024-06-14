import mongoose from "mongoose";
import bcrypt from "bcrypt";

const doctorSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
    trim: true,
  },
  last_name: {
    type: String,
    required: true,
    trim: true,
  },
  DOB: {
    type: Date,
    required: true,
  },
  is_consultant: {
    type: Boolean,
    required: true,
  },
  unit: {
    type: String,
    enum: ["Pediatrics", "Gynecology", "General Medicine", "Surgery"],
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  img_url: {
    type: String,
  },
  is_verified: {
    type: Boolean,
    default: false,
  },
  is_active:{
    type: Boolean,
    default:false
  },
  password: {
    type: String,
    required: true,
  },
  hasChangedSystemGeneratedPassword: {
    type: Boolean,
    default: false,
  },
});

doctorSchema.methods.comparePassword = async function (password) {
  try {
    const matches = await bcrypt.compare(password, this.password);
    console.log('matches', matches)
    return matches;
  } catch (error) {
    throw error;
  }
};

const DoctorModel = mongoose.model("Doctor", doctorSchema);

export default DoctorModel;

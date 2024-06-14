import mongoose from "mongoose";
import bcrypt from 'bcrypt'

const patientSchema = new mongoose.Schema({
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
  blood_group: {
    type: String,
    enum: ["A+", "B+", "AB+", "0+", "A-", "B-", "AB-", "0-"],
    required: true,
  },
  genotype: {
    type: String,
    enum: ["AA", "AS", "SS"],
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
    required: true,
    default: false,
  },
  password: {
    type: String,
    required: true,
  },
  verifyToken: {
    type: String,
  },
  tokenExpiresIn: {
    type: Date,
    default: function () {
      const now = new Date();
      return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours in milliseconds
    },
  },
});

patientSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

patientSchema.methods.comparePassword = async function(password){
  try {
    const match = await bcrypt.compare(password, this.password);
    return match;
  } catch (error) {
    throw error;
  }
};

const PatientModel = mongoose.model("Patient", patientSchema);

export default PatientModel;

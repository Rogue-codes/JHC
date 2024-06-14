import mongoose from "mongoose";
import bcrypt from "bcrypt";

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  owner: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  is_admin: {
    type: Boolean,
    default: true,
  },
});

hospitalSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

hospitalSchema.methods.comparePassword = async function(password) {
  try {
    const match = await bcrypt.compare(password, this.password);
    return match;
  } catch (error) {
    console.log(error)
    throw error;
  }
};

const HospitalModel = mongoose.model("Hospital", hospitalSchema);

export default HospitalModel;

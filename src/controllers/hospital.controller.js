import HospitalModel from "../models/hospital.model.js";
import { validateCreateHospital, validateLogin } from "../services/validator.js";
import lodash from "lodash";
import {genToken} from '../utils/genToken.js'

export const createHospital = async (req, res) => {
  try {
    const { error } = validateCreateHospital(req.body);
    if (error) {
      return res.status(422).json({
        success: false,
        message: error.details[0].message,
      });
    }

    // validate for email uniqueness
    const isExistingEmail = await HospitalModel.findOne({
      email: req.body.email,
    });
    if (isExistingEmail) {
      return res.status(400).json({
        success: false,
        message:`email: ${isExistingEmail.email} already exists`
      });
    }

    // validate for phone uniqueness
    const isExistingPhone = await HospitalModel.findOne({
      phone: req.body.phone,
    });
    if (isExistingPhone) {
      return res.status(400).json({
        success: false,
        message:`email: ${isExistingEmail.phone} already exists`
      });
    }

    // validate for username uniqueness
    const isExistingUserName = await HospitalModel.findOne({
      phone: req.body.username,
    });
    if (isExistingUserName) {
      return res.status(400).json({
        success: false,
        message: `username: ${isExistingEmail.username} already exists`,
      });
    }

    const { address, email, name, owner, password, phone, username } = req.body;

    const newHospital = await HospitalModel.create({
      address,
      email,
      name,
      owner,
      password,
      phone,
      username,
    });

    res.status(201).json({
      success: true,
      message: "Hospital created successfully...",
      data: lodash.pick(newHospital, [
        "name",
        "owner",
        "email",
        "phone",
        "username",
        "address",
        "_id"
      ]),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const loginAdmin = async(req,res) => {
  try {
    const {error} = validateLogin(req.body)
    if(error){
      return res.status(422).json({
        success:false,
        message: error.details[0].message
      })
    }

    // check if email is valid
    const admin = await HospitalModel.findOne({email:req.body.email})
    if(!admin){
      return res.status(400).json({
        success:false,
        message:"Invalid credentials..."
      })
    }
    // check if password is valid
    if(await !admin.comparePassword(req.body.password)) {
      return res.status(400).json({
        success:false,
        message:"Invalid credentials..."
      })
    }

    const token = genToken(admin._id)
    res.status(200).json({
      success:true,
      message:"Login successful (welcome admin)",
      data: lodash.pick(admin, [
        "_id",
        "name",
        "owner",
        "email",
        "phone",
        "username",
        "address",
      ]),
      access_token:token
    })
  } catch (error) {
    return res.status(error).json({
        success:false,
        message:error.message
    });
  }
};
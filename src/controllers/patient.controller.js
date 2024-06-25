import {
  validateCreatePatient,
  validateEmail,
  validateForgotPassword,
  validateLogin,
  validatePhone,
  validateResetPassword,
  validateUpdatePatient,
  validateVerifyAccount,
} from "../services/validator.js";
import PatientModel from "../models/patient.model.js";
import lodash from "lodash";
import { genRandomNumber } from "../utils/genRandomNumber.js";
import {
  sendPasswordResetMail,
  sendPasswordResetSuccessMail,
  sendPatientWelcomeMail,
} from "../services/mail.service.js";
import bcrypt from "bcrypt";
import { genToken } from "../utils/genToken.js";
import cloudinary from "cloudinary";
import { patientActivityLogMiddleware } from "../middlewares/logs.js";
import PatientActivityLogModel from "../models/patient.activity.model.js";

// register patient
export const registerPatient = async (req, res) => {
  try {
    console.log("req", req);
    const { error } = validateCreatePatient(req.body);
    if (error) {
      return res.status(422).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const {
      email,
      phone,
      first_name,
      last_name,
      DOB,
      blood_group,
      genotype,
      password,
      gender,
      patient_img,
    } = req.body;
    // check if email already exist
    const alreadyExistingUser = await PatientModel.findOne({ email });
    if (alreadyExistingUser) {
      return res.status(400).json({
        success: false,
        message: `patient with email: ${alreadyExistingUser.email} already exist`,
      });
    }

    console.log("a");

    // check if phone number already exist
    const alreadyExistingPhone = await PatientModel.findOne({ phone });
    if (alreadyExistingPhone) {
      return res.status(400).json({
        success: false,
        message: `patient with phone: ${alreadyExistingPhone.phone} already exist`,
      });
    }

    console.log("b");

    // gen verify token
    const salt = await bcrypt.genSalt(10);
    const randDigits = genRandomNumber();
    const verifyToken = await bcrypt.hash(randDigits, salt);

    // create new patient
    const newPatient = await PatientModel.create({
      email,
      phone,
      first_name,
      last_name,
      DOB,
      blood_group,
      genotype,
      password,
      verifyToken,
      img_url: patient_img ? patient_img : null,
      gender,
    });
    console.log("e");

    patientActivityLogMiddleware("CREATION", newPatient);

    // send it to patient mail
    sendPatientWelcomeMail(
      newPatient.email,
      randDigits,
      newPatient.first_name,
      newPatient.last_name
    );

    // return success message
    res.status(201).json({
      success: true,
      message: "patient profile created successfully...",
      data: lodash.pick(newPatient, [
        "first_name",
        "last_name",
        "email",
        "_id",
        "phone",
        "blood_group",
        "DOB",
        "genotype",
        "password",
        "is_verified",
        "img_url",
        "patient_id",
      ]),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// verify account
export const verifyAccount = async (req, res) => {
  try {
    const { error } = validateVerifyAccount(req.body);
    if (error) {
      return res.status(422).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { email, token } = req.body;
    // get the account to verify using it's email
    const patient = await PatientModel.findOne({ email });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: `patient with email:${email} not found`,
      });
    }

    // if account is already verified
    if (patient.is_verified) {
      return res.status(400).json({
        success: false,
        message: `patient with email:${email} already verified`,
      });
    }

    // compare current data with tokenExpiresIn

    const currentDate = new Date();
    const expiresIn = patient.tokenExpiresIn;

    if (currentDate > patient.tokenExpiresIn) {
      return res.status(400).json({
        success: false,
        message: "token has expired...",
      });
    }
    console.log("time:===>", { expiresIn, currentDate });

    // compare the hashed verifyToken to the one coming from FE
    const isVerifyTokenValid = await bcrypt.compare(token, patient.verifyToken);

    if (!isVerifyTokenValid) {
      return res.status(400).json({
        success: false,
        message: "invalid token...",
      });
    }

    patient.is_verified = true;
    patient.verifyToken = null;
    patient.tokenExpiresIn = null;

    await patient.save();

    patientActivityLogMiddleware("VERIFICATION", patient);

    res.status(200).json({
      success: true,
      message: "account verified successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// forgot password
export const forgotPassword = async (req, res) => {
  try {
    const { error } = validateForgotPassword(req.body);
    if (error) {
      return res.status(422).json({
        success: false,
        message: error.details[0].message,
      });
    }

    // get the patient using their email
    const patient = await PatientModel.findOne({ email: req.body.email });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: `email: ${req.body.email} does not exist on our records`,
      });
    }

    const randDigits = genRandomNumber();

    const salt = await bcrypt.genSalt(10);
    const verifyToken = await bcrypt.hash(randDigits, salt);

    const now = new Date();
    patient.verifyToken = verifyToken;
    patient.tokenExpiresIn = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    await patient.save();

    // send it to patient mail
    sendPasswordResetMail(
      patient.email,
      randDigits,
      patient.first_name,
      patient.last_name
    );
    res.status(200).json({
      success: true,
      message: `verification token has been sent to ${patient.email}`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// reset password
export const resetPassword = async (req, res) => {
  try {
    const { error } = validateResetPassword(req.body);
    if (error) {
      return res.status(422).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { email, token, password } = req.body;

    // get patient by email
    const patient = await PatientModel.findOne({ email });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: `patient with email: ${email} does not exists in our records`,
      });
    }

    const currentDate = new Date();

    if (currentDate > patient.tokenExpiresIn) {
      return res.status(400).json({
        success: false,
        message: "token has expired...",
      });
    }

    // verify token
    const isTokenValid = await bcrypt.compare(token, patient.verifyToken);
    if (!isTokenValid) {
      return res.status(400).json({
        success: false,
        message: "invalid token...",
      });
    }

    patient.password = password;
    patient.verifyToken = null;
    patient.tokenExpiresIn = null;

    await patient.save();

    res.status(200).json({
      success: true,
      message: "account verified successfully",
    });

    sendPasswordResetSuccessMail(
      patient.email,
      patient.first_name,
      patient.last_name
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// login
export const patientLogin = async (req, res) => {
  try {
    const { error } = validateLogin(req.body);
    if (error) {
      return res.status(422).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { email, password } = req.body;

    // get patient by email
    const patient = await PatientModel.findOne({ email });

    if (!patient) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials...",
      });
    }

    // check if password is valid
    if (await !patient.comparePassword(req.body.password)) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials...",
      });
    }

    const token = genToken(patient._id);
    res.status(200).json({
      success: true,
      message: "Login successful (welcome admin)",
      data: lodash.pick(patient, [
        "first_name",
        "last_name",
        "email",
        "_id",
        "phone",
        "blood_group",
        "DOB",
        "genotype",
        "password",
        "is_verified",
      ]),
      access_token: token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllPatients = async (req, res) => {
  try {
    let query = PatientModel.find();

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      query = query.find({
        $or: [
          { first_name: searchRegex },
          { last_name: searchRegex },
          { patient_id: searchRegex },
        ],
      });
    }

    if (req.query.sort) {
      const sortField = req.query.sort;
      query = query.sort(sortField);
    } else {
      query = query.sort("-createdAt");
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    const patientsCount = await PatientModel.countDocuments(query.getQuery());
    const last_page = Math.ceil(patientsCount / limit);

    if (page > last_page && last_page > 0) {
      throw new Error("This page does not exist");
    }

    const allPatients = await query.select(
      "-password -tokenExpiresIn -verifyToken"
    );

    if (!allPatients.length) {
      return res.status(200).json({
        status: "success",
        message: "No patient found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "All patients retrieved successfully",
      data: allPatients,
      meta: {
        per_page: limit,
        current_page: page,
        last_page: last_page,
        total: patientsCount,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "id is required",
      });
    }

    const patient = await PatientModel.findById(id).select(
      "-password -verifyToken -tokenExpiresIn"
    );
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "patient not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "patient retrieved successfully",
      data: patient,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPatientActivityLogs = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(404).json({
        success: false,
        message: "patient id not found",
      });
    }

    const log = await PatientActivityLogModel.find({ patientId: id });
    if (!log) {
      return res.status(404).json({
        success: false,
        message: "patient not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "patient activity logs retrieved successfully",
      data: log,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const validatePatientEmailAndPhone = async (req, res) => {
  try {
    if (req.query.email) {
      const { error } = validateEmail(req.query);
      if (error) {
        return res.status(422).json({
          success: false,
          message: error.details[0].message,
        });
      }
      const isExistingEmail = await PatientModel.find({
        email: req.query.email,
      });
      if (isExistingEmail.length > 0) {
        return res.status(200).json({
          data: true,
        });
      } else {
        return res.status(200).json({
          data: false,
        });
      }
    } else if (req.query.phone) {
      const { error } = validatePhone(req.query);
      if (error) {
        return res.status(422).json({
          success: false,
          message: error.details[0].message,
        });
      }
      const isExistingPhone = await PatientModel.find({
        phone: req.query.phone,
      });
      if (isExistingPhone.length > 0) {
        return res.status(200).json({
          data: true,
        });
      } else {
        return res.status(200).json({
          data: false,
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "invalid query params (allowable params: email || phone)",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const modifyPatient = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(404).json({
        success: false,
        message: "patient id not found",
      });
    }

    const { error } = validateUpdatePatient(req.body);
    if (error) {
      return res.status(422).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const patient = await PatientModel.findById(id).select("-password");
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "patient not found",
      });
    }

    patient.first_name = req.body.first_name;
    patient.last_name = req.body.last_name;
    patient.phone = req.body.phone;
    patient.blood_group = req.body.blood_group;
    patient.DOB = req.body.DOB;
    patient.genotype = req.body.genotype;
    patient.gender = req.body.gender;

    if (req.body.patient_img) {
      patient.img_url = req.body.patient_img;
    }

    await patient.save();

    patientActivityLogMiddleware("MODIFICATION", patient);

    res.status(200).json({
      success: true,
      message: "patient updated successfully",
      data: patient,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const searchPatients = async (req, res) => {
  try {
    const { search } = req.query; // Extract search term from query parameters
    const query = {};

    if (search) {
      const searchRegex = new RegExp(search, "i"); // Create regex from the search term
      query.$or = [
        { first_name: searchRegex },
        { last_name: searchRegex },
        { patient_id: searchRegex },
      ];
    }

    const patients = await PatientModel.find(query).select(
      "-password -tokenExpiresIn -verifyToken"
    );

    if (!patients.length) {
      return res.status(200).json({
        status: "success",
        message: "No patient found",
        data: [],
      });
    }

    return res.status(200).json({
      status: "success",
      message: "All patients retrieved successfully",
      data: patients,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

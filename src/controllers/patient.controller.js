import {
  validateCreatePatient,
  validateForgotPassword,
  validateLogin,
  validateResetPassword,
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

// register patient
export const registerPatient = async (req, res) => {
  try {
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
    } = req.body;
    // check if email already exist
    const alreadyExistingUser = await PatientModel.findOne({ email });
    if (alreadyExistingUser) {
      return res.status(400).json({
        success: false,
        message: `patient with email: ${alreadyExistingUser.email} already exist`,
      });
    }

    // check if phone number already exist
    const alreadyExistingPhone = await PatientModel.findOne({ phone });
    if (alreadyExistingPhone) {
      return res.status(400).json({
        success: false,
        message: `patient with phone: ${alreadyExistingPhone.phone} already exist`,
      });
    }

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
    });

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

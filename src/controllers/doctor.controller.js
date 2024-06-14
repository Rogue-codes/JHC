import {
  validateDoctorSchema,
  validateLogin,
  validateResetSystemGeneratedPassword,
} from "../services/validator.js";
import lodash from "lodash";
import { genRandomPassword } from "../utils/genRandomNumber.js";
import {
  sendDoctorWelcomeMail} from "../services/mail.service.js";
import bcrypt from "bcrypt";
import { genToken } from "../utils/genToken.js";
import DoctorModel from "../models/doctor.model.js";

// register doctor
export const registerDoctor = async (req, res) => {
  try {
    const { error } = validateDoctorSchema(req.body);
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
      is_consultant,
      unit,
      img_url,
    } = req.body;
    // check if email already exist
    const alreadyExistingDoctor = await DoctorModel.findOne({ email });
    if (alreadyExistingDoctor) {
      return res.status(400).json({
        success: false,
        message: `doctor with email: ${alreadyExistingDoctor.email} already exist`,
      });
    }

    // check if phone number already exist
    const alreadyExistingPhone = await DoctorModel.findOne({ phone });
    if (alreadyExistingPhone) {
      return res.status(400).json({
        success: false,
        message: `doctor with phone: ${alreadyExistingPhone.phone} already exist`,
      });
    }

    // gen system default password
    const randPassword = genRandomPassword(10);

    const salt = await bcrypt.genSalt(10);

    const password = await bcrypt.hash(randPassword, salt);
    // create new doctor
    const newDoctor = await DoctorModel.create({
      email,
      phone,
      first_name,
      last_name,
      DOB,
      is_consultant,
      unit,
      password,
      img_url,
    });

    // return success message
    res.status(201).json({
      success: true,
      message: "Doctor profile created successfully...",
      data: lodash.pick(newDoctor, [
        "first_name",
        "last_name",
        "email",
        "_id",
        "phone",
        "is_consultant",
        "DOB",
        "unit",
        "img_url",
        "is_verified",
      ]),
    });

    // send it to patient mail
    sendDoctorWelcomeMail(
      newDoctor.email,
      newDoctor.first_name,
      newDoctor.last_name,
      randPassword
    );
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// verify account
export const changeSystemGeneratedPassword = async (req, res) => {
  try {
    const { error } = validateResetSystemGeneratedPassword(req.body);
    if (error) {
      return res.status(422).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { id, old_password, password } = req.body;
    // get the account to verify using it's email
    const doctor = await DoctorModel.findById(id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: `doctor not found`,
      });
    }

    // if account is already verified
    if (doctor.hasChangedSystemGeneratedPassword) {
      return res.status(400).json({
        success: false,
        message: `System generated password has been changed already`,
      });
    }

    // compare old password
    const isOldPasswordValid = await bcrypt.compare(
      old_password,
      doctor.password
    );

    if (!isOldPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "old password is invalid...",
      });
    }

    const salt = await bcrypt.genSalt(10);

    doctor.is_verified = true;
    doctor.password = await bcrypt.hash(password,salt);
    doctor.hasChangedSystemGeneratedPassword = true;
    doctor.is_active = true;

    await doctor.save();

    res.status(200).json({
      success: true,
      message: "account verified successfully",
      redirect: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// login
export const doctorLogin = async (req, res) => {
  try {
    const { error } = validateLogin(req.body);
    if (error) {
      return res.status(422).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { email, password } = req.body;

    // get doctor by email
    const doctor = await DoctorModel.findOne({ email });

    if (!doctor) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials...",
      });
    }

    if (!doctor.hasChangedSystemGeneratedPassword) {
      return res.status(400).json({
        success: false,
        message: "please change your system generated password...",
      });
    }

    // check if password is valid
    const isPasswordvalid = await doctor.comparePassword(password);
    console.log('first', isPasswordvalid);
    if (!isPasswordvalid) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials...",
      });
    }

    const token = genToken(doctor._id);
    res.status(200).json({
      success: true,
      message: `Login successful (welcome ${doctor.first_name} ${doctor.last_name})`,
      data: lodash.pick(doctor, [
        "first_name",
        "last_name",
        "email",
        "_id",
        "phone",
        "is_consultant",
        "DOB",
        "unit",
        "img_url",
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



// forgot password
// export const forgotPassword = async (req, res) => {
//   try {
//     const { error } = validateForgotPassword(req.body);
//     if (error) {
//       return res.status(422).json({
//         success: false,
//         message: error.details[0].message,
//       });
//     }

//     // get the patient using their email
//     const patient = await PatientModel.findOne({ email: req.body.email });
//     if (!patient) {
//       return res.status(404).json({
//         success: false,
//         message: `email: ${req.body.email} does not exist on our records`,
//       });
//     }

//     const randDigits = genRandomNumber();

//     const salt = await bcrypt.genSalt(10);
//     const verifyToken = await bcrypt.hash(randDigits, salt);

//     const now = new Date();
//     patient.verifyToken = verifyToken;
//     patient.tokenExpiresIn = new Date(now.getTime() + 24 * 60 * 60 * 1000);

//     await patient.save();

//     // send it to patient mail
//     sendPasswordResetMail(
//       patient.email,
//       randDigits,
//       patient.first_name,
//       patient.last_name
//     );
//     res.status(200).json({
//       success: true,
//       message: `verification token has been sent to ${patient.email}`,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// reset password
// export const resetPassword = async (req, res) => {
//   try {
//     const { error } = validateResetPassword(req.body);
//     if (error) {
//       return res.status(422).json({
//         success: false,
//         message: error.details[0].message,
//       });
//     }

//     const { email, token, password } = req.body;

//     // get patient by email
//     const patient = await PatientModel.findOne({ email });
//     if (!patient) {
//       return res.status(404).json({
//         success: false,
//         message: `patient with email: ${email} does not exists in our records`,
//       });
//     }

//     const currentDate = new Date();

//     if (currentDate > patient.tokenExpiresIn) {
//       return res.status(400).json({
//         success: false,
//         message: "token has expired...",
//       });
//     }

//     // verify token
//     const isTokenValid = await bcrypt.compare(token, patient.verifyToken);
//     if (!isTokenValid) {
//       return res.status(400).json({
//         success: false,
//         message: "invalid token...",
//       });
//     }

//     patient.password = password;
//     patient.verifyToken = null;
//     patient.tokenExpiresIn = null;

//     await patient.save();

//     res.status(200).json({
//       success: true,
//       message: "account verified successfully",
//     });

//     sendPasswordResetSuccessMail(
//       patient.email,
//       patient.first_name,
//       patient.last_name
//     );
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

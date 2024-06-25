import {
  validateDoctorSchema,
  validateEmail,
  validateLogin,
  validatePhone,
  validateResetSystemGeneratedPassword,
} from "../services/validator.js";
import lodash from "lodash";
import { genRandomPassword } from "../utils/genRandomNumber.js";
import { sendDoctorWelcomeMail } from "../services/mail.service.js";
import bcrypt from "bcrypt";
import { genToken } from "../utils/genToken.js";
import DoctorModel from "../models/doctor.model.js";
import { activityLogMiddleware } from "../middlewares/logs.js";
import ActivityLogModel from "../models/activityLog.model.js";

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
      gender,
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
      gender,
    });

    activityLogMiddleware("ADMIN", "Creation", newDoctor);

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
    doctor.password = await bcrypt.hash(password, salt);
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
    console.log("first", isPasswordvalid);
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
export const forgotPassword = async (req, res) => {
  try {
    const { error } = validateForgotPassword(req.body);
    if (error) {
      return res.status(422).json({
        success: false,
        message: error.details[0].message,
      });
    }

    // get the doctor using their email
    const doctor = await DoctorModel.findOne({ email: req.body.email });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: `email: ${req.body.email} does not exist on our records`,
      });
    }

    const randDigits = genRandomNumber();

    const salt = await bcrypt.genSalt(10);
    const verifyToken = await bcrypt.hash(randDigits, salt);

    const now = new Date();
    doctor.verifyToken = verifyToken;
    doctor.tokenExpiresIn = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    await doctor.save();

    // send it to patient mail
    sendPasswordResetMail(
      doctor.email,
      randDigits,
      doctor.first_name,
      doctor.last_name
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
    const doctor = await DoctorModel.findOne({ email });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: `doctor with email: ${email} does not exists in our records`,
      });
    }

    const currentDate = new Date();

    if (currentDate > doctor.tokenExpiresIn) {
      return res.status(400).json({
        success: false,
        message: "token has expired...",
      });
    }

    // verify token
    const isTokenValid = await bcrypt.compare(token, doctor.verifyToken);
    if (!isTokenValid) {
      return res.status(400).json({
        success: false,
        message: "invalid token...",
      });
    }

    doctor.password = password;
    doctor.verifyToken = null;
    doctor.tokenExpiresIn = null;

    await doctor.save();

    res.status(200).json({
      success: true,
      message: "account verified successfully",
    });

    sendPasswordResetSuccessMail(
      doctor.email,
      doctor.first_name,
      doctor.last_name
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getDoctors = async (req, res) => {
  try {
    let query = DoctorModel.find();

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      query = query.find({
        $or: [{ first_name: searchRegex }],
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

    const doctorsCount = await DoctorModel.countDocuments(query.getQuery());
    const last_page = Math.ceil(doctorsCount / limit);

    if (page > last_page && last_page > 0) {
      throw new Error("This page does not exist");
    }

    const allDoctors = await query.select("-password");

    if (!allDoctors.length) {
      return res.status(200).json({
        status: "success",
        message: "No Employee Found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "All Doctors retrieved successfully",
      data: allDoctors,
      meta: {
        per_page: limit,
        current_page: page,
        last_page: last_page,
        total: doctorsCount,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const validateDoctorEmailAndPhone = async (req, res) => {
  try {
    if (req.query.email) {
      const { error } = validateEmail(req.query);
      if (error) {
        return res.status(422).json({
          success: false,
          message: error.details[0].message,
        });
      }
      const isExistingEmail = await DoctorModel.find({
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
      const isExistingPhone = await DoctorModel.find({
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

export const changeDoctorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res.status(404).json({
        success: false,
        message: "doctor id not found",
      });

    // get the doctor by id
    const doctor = await DoctorModel.findById(id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "doctor not found",
      });
    }
    doctor.is_active ? (doctor.is_active = false) : (doctor.is_active = true);
    await doctor.save();

    const active = doctor.is_active ? "REACTIVATION" : "DEACTIVATION";

    activityLogMiddleware("ADMIN", active, doctor);

    res.status(200).json({
      success: true,
      message: `${
        doctor.is_active
          ? "Doctor Reactivated successfully"
          : "Doctor Deactivated successfully"
      }`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(404).json({
        success: false,
        message: "doctor id not found",
      });
    }

    const doctor = await DoctorModel.findById(id).select("-password");
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "doctor not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "doctor retrieved successfully",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const modifyDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(404).json({
        success: false,
        message: "doctor id not found",
      });
    }

    const { error } = validateDoctorSchema(req.body);
    if (error) {
      return res.status(422).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const doctor = await DoctorModel.findById(id).select("-password");
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "doctor not found",
      });
    }

    doctor.first_name = req.body.first_name;
    doctor.last_name = req.body.last_name;
    doctor.phone = req.body.phone;
    doctor.unit = req.body.unit;
    doctor.DOB = req.body.DOB;
    doctor.is_consultant = req.body.is_consultant;
    doctor.gender = req.body.gender;

    await doctor.save();

    activityLogMiddleware("ADMIN", "Modification", doctor);

    res.status(200).json({
      success: true,
      message: "doctor updated successfully",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getActivityLogs = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(404).json({
        success: false,
        message: "doctor id not found",
      });
    }

    const log = await ActivityLogModel.find({ doctorId: id });
    if (!log) {
      return res.status(404).json({
        success: false,
        message: "doctor not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "doctor activity logs retrieved successfully",
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

export const getActiveDoctors = async (req, res) => {
  try {
    const doctors = await DoctorModel.find({ is_active: true });
    if (!doctors) {
      return res.status(404).json({
        success: false,
        message: "doctor not found",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "active doctors retrieved successfully",
      data: doctors,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

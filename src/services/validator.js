import Joi from "joi";

const validator = (schema) => (payload) =>
  schema.validate(payload, { abortEarly: false });

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const registerPatientSchema = Joi.object({
  email: Joi.string().email().required(),
  first_name: Joi.string().min(3).required(),
  DOB: Joi.date()
    .iso()
    .less("now")
    .greater(new Date(new Date().setFullYear(new Date().getFullYear() - 100)))
    .required()
    .messages({
      "date.base": "Date of birth must be a valid date",
      "date.less": "Date of birth must be in the past",
      "date.greater": "Date of birth must be within the last 100 years",
      "any.required": "Date of birth is required",
    }),
  last_name: Joi.string().min(3).required(),
  blood_group: Joi.string().min(2).max(3).required(),
  genotype: Joi.string().min(2).max(2).required(),
  phone: Joi.string().min(11).max(15).required(),
  password: Joi.string().min(6).required(),
  confirm_password: Joi.ref("password"),
});

const registerDoctorSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email must be a valid email",
    "any.required": "Email is required",
  }),
  first_name: Joi.string().min(3).required().messages({
    "string.min": "First name must be at least 3 characters long",
    "any.required": "First name is required",
  }),
  last_name: Joi.string().min(3).required().messages({
    "string.min": "Last name must be at least 3 characters long",
    "any.required": "Last name is required",
  }),
  phone: Joi.string().min(11).max(15).required().messages({
    "string.min": "Phone number must be at least 11 characters long",
    "string.max": "Phone number must be at most 15 characters long",
    "any.required": "Phone number is required",
  }),
  DOB: Joi.date()
    .iso()
    .less("now")
    .greater(new Date(new Date().setFullYear(new Date().getFullYear() - 100)))
    .required()
    .messages({
      "date.base": "Date of birth must be a valid date",
      "date.less": "Date of birth must be in the past",
      "date.greater": "Date of birth must be within the last 100 years",
      "any.required": "Date of birth is required",
    }),
  is_consultant: Joi.boolean().required().messages({
    "any.required": "Consultant status is required",
  }),
  unit: Joi.string()
    .valid("Pediatrics", "Gynecology", "General Medicine", "Surgery")
    .required()
    .messages({
      "any.only":
        "Unit must be one of Pediatrics, Gynecology, General Medicine, or Surgery",
      "any.required": "Unit is required",
    }),
  img_url: Joi.string().optional().messages({
    "string.base": "Image URL must be a valid string",
  }),
});

const verifyAccountSchema = Joi.object({
  email: Joi.string().email().required(),
  token: Joi.string().min(6).max(6).required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  token: Joi.string().min(6).max(6).required(),
  password: Joi.string().min(6).required(),
  confirm_password: Joi.string()
    .valid(Joi.ref("password"))
    .required()
    .messages({
      "any.only": "Confirm password must be the same as the password",
      "any.required": "Confirm password is required",
    }),
});

const resetSystemGeneratedPasswordSchema = Joi.object({
  id: Joi.string().required(),
  old_password: Joi.string().required(),
  password: Joi.string().min(6).required(),
  confirm_password: Joi.string()
    .valid(Joi.ref("password"))
    .required()
    .messages({
      "any.only": "Confirm password must be the same as the password",
      "any.required": "Confirm password is required",
    }),
});

const createReservationSchema = Joi.object({
  time: Joi.string().isoDate().required().messages({
    "string.isoDate": "Time must be a valid ISO date string",
    "any.required": "Time is required",
  }),
  date: Joi.date().iso().required().messages({
    "date.base": "Date must be a valid date",
    "date.format": "Date must be in ISO format",
    "any.required": "Date is required",
  }),
  patient: Joi.string().required().messages({
    "any.required": "Patient is required",
  }),
  doctor: Joi.string().required().messages({
    "any.required": "Doctor is required",
  })
});

const createHospitalSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().min(6).required().email(),
  phone: Joi.string().min(11).max(15).required(),
  owner: Joi.string().required().min(3),
  address: Joi.string().min(3).required(),
  username: Joi.string().min(3).required(),
  password: Joi.string().min(6).required(),
});

export const validateLogin = validator(loginSchema);
export const validateCreateHospital = validator(createHospitalSchema);
export const validateCreatePatient = validator(registerPatientSchema);
export const validateVerifyAccount = validator(verifyAccountSchema);
export const validateForgotPassword = validator(forgotPasswordSchema);
export const validateResetPassword = validator(resetPasswordSchema);
export const validateDoctorSchema = validator(registerDoctorSchema);
export const validateResetSystemGeneratedPassword = validator(resetSystemGeneratedPasswordSchema);
export const validateReservation = validator(createReservationSchema);
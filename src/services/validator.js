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
  blood_group: Joi.string()
    .valid("A+", "B+", "AB+", "0+", "A-", "B-", "AB-", "0-")
    .min(2)
    .max(3)
    .required(),
  genotype: Joi.string().valid("AA", "AS", "SS").min(2).max(2).required(),
  gender: Joi.string().valid("male", "female").min(2).max(2).required(),
  phone: Joi.string().min(11).max(15).required(),
  password: Joi.string().min(6).required(),
  confirm_password: Joi.ref("password"),
  patient_img: Joi.any(),
});

const modifyPatientSchema = Joi.object({
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
  blood_group: Joi.string()
    .valid("A+", "B+", "AB+", "0+", "A-", "B-", "AB-", "0-")
    .min(2)
    .max(3)
    .required(),
  genotype: Joi.string().valid("AA", "AS", "SS").min(2).max(2).required(),
  gender: Joi.string().valid("male", "female").min(2).max(2).required(),
  phone: Joi.string().min(11).max(15).required(),
  patient_img: Joi.any(),
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
  gender: Joi.string().valid("female", "male").min(4).required().messages({
    "string.min": "gender must be at least 4 characters long",
    "any.required": "gender is required",
    "any.only": "Gender must be one of male, female",
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
  patient: Joi.string().required().messages({
    "any.required": "Patient is required",
  }),
  doctor: Joi.string().required().messages({
    "any.required": "Doctor is required",
  }),
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

const validateEmailSchema = Joi.object({
  email: Joi.string().email().required(),
});

const validatePhoneSchema = Joi.object({
  phone: Joi.string().min(11).max(15).required().messages({
    "string.min": "Phone number must be at least 11 characters long",
    "string.max": "Phone number must be at most 15 characters long",
    "any.required": "Phone number is required",
  }),
});

const createProductSchema = Joi.object({
  name: Joi.string().min(3).required().messages({
    "string.base": "Name must be a string",
    "string.min": "Name must be at least 3 characters long",
    "any.required": "Name is required",
  }),
  price: Joi.number().greater(50).required().messages({
    "number.base": "Price must be a number",
    "number.greater": "Price must be greater than 50",
    "any.required": "Price is required",
  }),
  quantity: Joi.number().greater(1).required().messages({
    "number.base": "Quantity must be a number",
    "number.greater": "Quantity must be greater than 1",
    "any.required": "Quantity is required",
  }),
  description: Joi.string().min(3).required().messages({
    "string.base": "Description must be a string",
    "string.min": "Description must be at least 3 characters long",
    "any.required": "Description is required",
  }),
  expiry_date: Joi.date().iso().required().messages({
    "date.base": "Expiry date must be a valid date",
    "date.format": "Expiry date must be in ISO format",
    "any.required": "Expiry date is required",
  }),
  manufacturer: Joi.string().min(3).required().messages({
    "string.base": "Manufacturer must be a string",
    "string.min": "Manufacturer must be at least 3 characters long",
    "any.required": "Manufacturer is required",
  }),
  category: Joi.string()
    .valid("Inhaler", "Tablet", "Syrup", "Cream", "Capsule", "Soap")
    .required()
    .messages({
      "string.base": "Category must be a string",
      "any.only":
        "Category must be one of Inhaler, Tablet, Syrup, Cream, Capsule, Soap",
      "any.required": "Category is required",
    }),
  images: Joi.array(),
});

export const validateLogin = validator(loginSchema);
export const validateCreateHospital = validator(createHospitalSchema);
export const validateCreatePatient = validator(registerPatientSchema);
export const validateUpdatePatient = validator(modifyPatientSchema);
export const validateVerifyAccount = validator(verifyAccountSchema);
export const validateForgotPassword = validator(forgotPasswordSchema);
export const validateResetPassword = validator(resetPasswordSchema);
export const validateDoctorSchema = validator(registerDoctorSchema);
export const validateResetSystemGeneratedPassword = validator(
  resetSystemGeneratedPasswordSchema
);
export const validateReservation = validator(createReservationSchema);
export const validateEmail = validator(validateEmailSchema);
export const validatePhone = validator(validatePhoneSchema);
export const validateProduct = validator(createProductSchema);

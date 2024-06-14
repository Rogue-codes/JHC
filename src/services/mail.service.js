import nodemailer from "nodemailer";
import "dotenv/config";

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.USERNAME,
    pass: process.env.APP_PASSWORD,
  },
});

export const sendPatientWelcomeMail = async (
  email,
  token,
  first_name,
  last_name
) => {
  try {
    const options = {
      from: "nnamdidanielosuji@gmail.com", // sender address
      to: email, // receiver email
      subject: "Welcome to JHC", // Subject line
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to JHC Clinics!</h2>
      <p>Hello ${first_name} ${last_name},</p>
      <p>Thanks for joining the JHC family, we are pleased to have you on board!!!.
      in order to complete your sign up process, you'll be required to verify your
      account using the verification token sent below:</p>
      <ul>
        <li><strong>Verification Token:</strong> ${token}</li>
      </ul>
      <p>Thanks!</p>
      <p>Best regards,<br>JHC Hospitals</p>
    </div>
      `,
    };
    const info = await transporter.sendMail(options);
    // callback(info);
  } catch (error) {
    console.error(error);
  }
};

export const sendDoctorWelcomeMail = async (
  email,
  first_name,
  last_name,
  password
) => {
  try {
    const options = {
      from: "nnamdidanielosuji@gmail.com", // sender address
      to: email, // receiver email
      subject: "Welcome to JHC Clinics", // Subject line
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to JHC Clinics App!</h2>
      <p>Hello ${first_name} ${last_name},</p>
      <p>Welcome to JHC Clinics App! Below are your login details:</p>
      <ul>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Password:</strong> ${password}</li> <!-- Include generated password here -->
      </ul>
      <p>You can now log in to the JHC Clinics app using the above credentials. For security reasons, you'll be prompted to change your password after logging in.</p>
      <p>Thanks!</p>
      <p>Best regards,<br>JHC Clinics Dev Team</p>
    </div>
      `,
    };
    const info = await transporter.sendMail(options);
    // callback(info);
  } catch (error) {
    console.error(error);
  }
};

export const sendPasswordResetMail = async (
  email,
  resetToken,
  first_name,
  last_name
) => {
  try {
    const options = {
      from: "nnamdidanielosuji@gmail.com", // sender address
      to: email, // receiver email
      subject: "Password Reset Request", // Subject line
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hello ${first_name} ${last_name},</p>
        <p>We received a request to reset your password for your JHC Clinics account.
        If you did not make this request, you can ignore this email. Otherwise, you can reset your password using the token provided below:</p>
        <ul>
          <li><strong>Password Reset Token:</strong> ${resetToken}</li>
        </ul>
        <p>This token will expire in 24 hours.</p>
        <p>If you have any questions or need further assistance, please contact our support team.</p>
        <p>Thanks!</p>
        <p>Best regards,<br>JHC Hospitals</p>
      </div>
      `,
    };
    const info = await transporter.sendMail(options);
    console.log("Password reset email sent:", info);
  } catch (error) {
    console.error("Error sending password reset email:", error);
  }
};

export const sendPasswordResetSuccessMail = async (
  email,
  first_name,
  last_name
) => {
  try {
    const options = {
      from: "nnamdidanielosuji@gmail.com", // sender address
      to: email, // receiver email
      subject: "Password Reset Successful", // Subject line
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Successful</h2>
        <p>Hello ${first_name} ${last_name},</p>
        <p>We wanted to let you know that your password has been successfully reset for your JHC Clinics account.</p>
        <p>If you did not make this request, please contact our support team immediately to secure your account.</p>
        <p>If you have any questions or need further assistance, please don't hesitate to reach out to our support team.</p>
        <p>Thanks!</p>
        <p>Best regards,<br>JHC Hospitals</p>
      </div>
      `,
    };
    const info = await transporter.sendMail(options);
    console.log("Password reset successful email sent:", info);
  } catch (error) {
    console.error("Error sending password reset successful email:", error);
  }
};
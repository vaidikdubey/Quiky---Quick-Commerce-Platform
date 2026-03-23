import { Router } from "express";
import {
  userRegistrationValidator,
  riderProfileValidator,
  storeRegisterValidator,
  userLoginValidator,
  forgotPasswordValidator,
  resetPasswordValidate,
  changePasswordValidate,
} from "../validators/index.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
  changePassword,
  deleteProfile,
  forgotPassword,
  getProfile,
  loginUser,
  logoutUser,
  registerRider,
  registerStore,
  registerUser,
  resendVerificationEmail,
  resetPassword,
  sendOTP,
  updateProfile,
  verifyPhone,
  verifyUser,
} from "../controllers/auth.controllers.js";

const router = Router();

router
  .route("/register")
  .post(userRegistrationValidator(), validate, registerUser);

router
  .route("/register/rider")
  .post(isLoggedIn, riderProfileValidator(), validate, registerRider);

router
  .route("/register/store")
  .post(isLoggedIn, storeRegisterValidator(), validate, registerStore);

router.route("/login").post(userLoginValidator(), validate, loginUser);

//OTP Verification route
router.route("/verify/:token").get(verifyUser);

//OTP Generation route
router.route("/send-otp").post(isLoggedIn, sendOTP);

router.route("/verify-phone").post(isLoggedIn, verifyPhone);

router.route("/me").get(isLoggedIn, getProfile);

router.route("/logout").get(isLoggedIn, logoutUser);

router
  .route("/forgot-password")
  .post(forgotPasswordValidator(), validate, forgotPassword);

router
  .route("/reset-password/:token")
  .post(resetPasswordValidate(), validate, resetPassword);

router.route("/resend-verification").get(isLoggedIn, resendVerificationEmail);

router
  .route("/change-password")
  .post(isLoggedIn, changePasswordValidate(), validate, changePassword);

router.route("/update-profile").patch(isLoggedIn, updateProfile);

router.route("/delete-user").delete(isLoggedIn, deleteProfile);

export default router;

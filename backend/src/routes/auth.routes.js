import { Router } from "express";

const router = Router();

router
  .route("/register")
  .post(userRegistrationValidator(), validate, registerUser);

router.route("/login").post(userLoginValidator(), validate, loginUser);

router.route("/verify/:token").get(verifyUser);

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
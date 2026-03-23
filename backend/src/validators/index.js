import { body } from "express-validator";

const userRegistrationValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
    body("name").notEmpty().withMessage("Name is required"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be atleast 8 characters")
      .matches(/[a-z]/)
      .withMessage("Password must contain at least one lowercase letter")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/\d/)
      .withMessage("Password must contain at least one digit")
      .matches(/[@$!%*?&]/)
      .withMessage("Password must contain at least one special character"),
  ];
};

const storeRegisterValidator = () => {
  return [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Store name is required")
      .isLength({ min: 3 }),
    body("address")
      .trim()
      .notEmpty()
      .withMessage("Store address is required")
      .isLength({ min: 3 }),
    body("latitude").optional().isLatLong().withMessage("Invalid latitude"),
    body("longitude").optional().isLatLong().withMessage("Invalid longitude"),
    body("pincode")
      .trim()
      .notEmpty()
      .withMessage("Pincode is required")
      .isPostalCode("IN"),
  ];
};

const userLoginValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
    body("password").notEmpty().withMessage("Password cannot be empty"),
  ];
};

const forgotPasswordValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
  ];
};

const resetPasswordValidate = () => {
  return [
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be atleast 8 characters")
      .matches(/[a-z]/)
      .withMessage("Password must contain at least one lowercase letter")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/\d/)
      .withMessage("Password must contain at least one digit")
      .matches(/[@$!%*?&]/)
      .withMessage("Password must contain at least one special character"),
  ];
};

const changePasswordValidate = () => {
  return [
    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("Password must be atleast 8 characters")
      .matches(/[a-z]/)
      .withMessage("Password must contain at least one lowercase letter")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/\d/)
      .withMessage("Password must contain at least one digit")
      .matches(/[@$!%*?&]/)
      .withMessage("Password must contain at least one special character"),
  ];
};

export {
  userRegistrationValidator,
  storeRegisterValidator,
  userLoginValidator,
  forgotPasswordValidator,
  resetPasswordValidate,
  changePasswordValidate,
};

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

const riderProfileValidator = () => {
  return [
    body("licenseNumber")
      .trim()
      .notEmpty()
      .withMessage("License number is required")
      .isLength({ min: 9, max: 11 })
      .isAlphanumeric("en-IN", { ignore: " " })
      .withMessage("Invalid license number format")
      .matches(
        /^(?:[A-Z]{2}\s?\d{1,2}\s?[A-Z]{0,3}\s?\d{1,4}|[0-9]{2}\s?BH\s?[0-9]{4}\s?[A-Z]{2})$/,
      )
      .withMessage("Invalid license number"),
    body("currentLatitue")
      .optional()
      .isLatLong()
      .withMessage("Invalid latitude"),
    body("currentLongitude")
      .optional()
      .isLatLong()
      .withMessage("Invalid latitude"),
    body("totalDeliveries")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Invalid total deliveries"),
    body("rating")
      .optional()
      .isFloat({ min: 0, max: 5 })
      .withMessage("Invalid rating"),
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
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
    body("phone")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Phone number is required")
      .isMobilePhone("en-IN")
      .withMessage("Invalid phone number"),
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
  riderProfileValidator,
  storeRegisterValidator,
  userLoginValidator,
  forgotPasswordValidator,
  resetPasswordValidate,
  changePasswordValidate,
};

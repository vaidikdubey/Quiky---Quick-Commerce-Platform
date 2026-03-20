import bcrypt from "bcryptjs";
import { db } from "../db/db.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import {
  generateAccessToken,
  generateRefreshToken,
  generateTemporaryToken,
} from "../utils/generate-tokens.js";
import {
  emailVerificationMailgenContent,
  verifiedEmailMailgenContent,
  forgotPasswordMailgenContent,
  resendEmailVerificationMailgenContent,
  sendEmail,
  emailReverificationMailgenContent,
  profileDeletionMailgenContent,
} from "../utils/mail.js";
import { cookieOptions } from "../utils/constants.js";
import crypto from "crypto";

const registerUser = asyncHandler(async (req, res) => {
  const defaultImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=888888&color=ffffff&size=128`;

  const {
    name,
    email,
    phone,
    password,
    role,
    avatarUrl = defaultImage,
  } = req.body;

  if (!name || !email || !password || !role || !phone)
    throw new ApiError(400, "All fields are required");

  const existingUser = await db.user.findUnique({
    where: {
      email,
      phone,
    },
  });

  if (existingUser) throw new ApiError(400, "User already exists");

  const hashedPassword = await bcrypt.hash(password, 10);

  const temporaryToken = generateTemporaryToken();

  let user = await db.user.create({
    data: {
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      avatarUrl,
      verificationToken: temporaryToken.hashedToken,
      verificationExpiry: temporaryToken.tokenExpiry,
    },
  });

  const accessToken = generateAccessToken({ id: user.id });
  const refreshToken = generateRefreshToken({ id: user.id, role });

  user = await db.user.update({
    where: {
      id: user.id,
    },
    data: {
      refreshToken,
    },
  });

  res.cookie("accessToken", accessToken, cookieOptions);

  const refreshTokenCookieOptions = {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

  const emailOptions = {
    email: user.email,
    subject: "Verify your email",
    mailgenContent: emailVerificationMailgenContent(
      name,
      `${process.env.BASE_URL}/api/v1/auth/verify/${temporaryToken.unHashedToken}`,
    ),
  };

  await sendEmail(emailOptions);

  res.status(201).json(
    new ApiResponse(
      200,
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      "User created successfully",
    ),
  );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password, phone } = req.body;

  if (!email || !password || !phone)
    throw new ApiError(404, "All fields are required");

  let user;
  //Find user conditionally, based on user providing email or phone number for login
  if (email && !phone) {
    user = await db.user.findUnique({
      where: {
        email,
      },
    });
  } else if (phone && !email) {
    user = await db.user.findUnique({
      where: {
        phone,
      },
    });
  }

  if (!user) throw new ApiError(401, "Invalid credentials");

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) throw new ApiError(401, "Invalid credentials");

  const accessToken = generateAccessToken({ id: user.id });
  const refreshToken = generateRefreshToken({ id: user.id, role: user.role });

  user = await db.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  res.cookie("accessToken", accessToken, cookieOptions);

  const refreshTokenCookieOptions = {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        accessToken,
      },
      "User login successful",
    ),
  );
});

const verifyUser = asyncHandler(async (req, res) => {
  const { token } = req.params;

  if (!token) throw new ApiError(404, "Token not found");

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  let user = await db.user.findUnique({
    where: {
      verificationToken: hashedToken,
      verificationExpiry: {
        gt: new Date(),
      },
    },
  });

  if (!user) throw new ApiError(404, "Invalid token");

  user = await db.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      verificationToken: null,
      verificationExpiry: null,
    },
  });

  const emailOptions = {
    email: user.email,
    subject: "Welcome to Quiky!",
    mailgenContent: verifiedEmailMailgenContent(user.name),
  };

  await sendEmail(emailOptions);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      "Email verification successful",
    ),
  );
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await db.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      password: true,
      role: true,
      avatarUrl: true,
      isActive: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
      riderProfile: {
        select: {
          id: true,
          licenseNumber: true,
          currentLatitue: true,
          currentLongitude: true,
          lastLocationUpdate: true,
          totalDeliveries: true,
          rating: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!user) throw new ApiError(404, "User not found");

  let responseData;

  if (user.role != "RIDER") {
    responseData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  } else {
    responseData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      riderProfile: user.riderProfile,
    };
  }

  res
    .status(200)
    .json(new ApiResponse(200, responseData, "User profile fetched"));
});

const logoutUser = asyncHandler(async (req, res) => {
  const clearCookieOptions = {
    ...cookieOptions,
    maxAge: new Date(0),
  };

  res.clearCookie("accessToken", clearCookieOptions);
  res.clearCookie("refreshToken", clearCookieOptions);

  res
    .status(200)
    .json(
      new ApiResponse(200, { message: "Tokens cleared" }, "User logged out"),
    );
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) throw new ApiError(404, "Email is required");

  let user = await db.user.findUnique({
    where: { email },
  });

  if (!user) throw new ApiError(404, "Invalid email address");

  const temporaryToken = generateTemporaryToken();

  user = await db.user.update({
    where: { email },
    data: {
      passwordResetToken: temporaryToken.hashedToken,
      passwordResetExpiry: temporaryToken.tokenExpiry,
    },
  });

  const mailOptions = {
    email: user.email,
    subject: "Reset your password",
    mailgenContent: forgotPasswordMailgenContent(
      user.name,
      `${process.env.BASE_URL}/api/v1/auth/reset-password/${temporaryToken.unHashedToken}`,
    ),
  };

  await sendEmail(mailOptions);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { message: "Email sent successfully" },
        "Forgot password successful",
      ),
    );
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const { password } = req.body;

  if (!token) throw new ApiError(404, "Token not found");

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  let user = await db.user.findUnique({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpiry: {
        gt: new Date(),
      },
    },
  });

  if (!user) throw new ApiError(404, "User not found");

  const hashedPassword = await bcrypt.hash(password, 10);

  user = await db.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpiry: null,
    },
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        id: user.id,
        name: user.name,
        email: user.emai,
        role: user.role,
      },
      "Password reset successful",
    ),
  );
});

const changePassword = asyncHandler(async (req, res) => {
  let user = await db.user.findUnique({
    where: { id: req.user.id },
  });

  if (!user) throw new ApiError(404, "User not found");

  const { oldPassword, newPassword } = req.body;

  const isPasswordMatched = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordMatched)
    throw new ApiError(400, "Incorrect existing password");

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const accessToken = generateAccessToken({ id: user.id });
  const refreshToken = generateRefreshToken({ id: user.id, role: user.role });

  user = await db.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      refreshToken,
    },
  });

  res.cookie("accessToken", accessToken, cookieOptions);

  const refreshTokenCookieOptions = {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        accessToken,
      },
      "Password change successful",
    ),
  );
});

const resendVerificationEmail = asyncHandler(async (req, res) => {
  let user = await db.user.findUnique({ where: { id: req.user.id } });

  if (!user) throw new ApiError(404, "User not found");

  if (user.isVerified)
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { message: "Email already verified" },
          "Email already verified",
        ),
      );

  const temporaryToken = generateTemporaryToken();

  user = await db.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: temporaryToken.hashedToken,
      passwordResetExpiry: temporaryToken.tokenExpiry,
    },
  });

  const emailOptions = {
    email: user.email,
    subject: "Verify your email",
    mailgenContent: resendEmailVerificationMailgenContent(
      user.name,
      `${process.env.BASE_URL}/api/v1/auth/verify/${temporaryToken.unHashedToken}`,
    ),
  };

  await sendEmail(emailOptions);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      "Verification email sent successfully",
    ),
  );
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, phone, avatarUrl } = req.body;

  if (!name && !email && !phone && !avatarUrl)
    throw new ApiError(400, "Please provide something to be updated");

  const updatedData = {};
  let temporaryToken = null;

  if (name) updatedData.name = name;

  if (email) {
    const existingUser = await db.user.findUnique({ where: { email } });

    if (existingUser && existingUser.id !== req.user.id)
      throw new ApiError(
        409,
        "Email is already registered with another account",
      );

    updatedData.email = email;
    updatedData.isVerified = false;

    temporaryToken = generateTemporaryToken();
    updatedData.verificationToken = temporaryToken.hashedToken;
    updatedData.verificationExpiry = temporaryToken.tokenExpiry;
  }

  if (phone) updatedData.phone = phone;

  if (avatarUrl) updatedData.avatarUrl = avatarUrl;

  const user = await db.user.update({
    where: { id: req.user.id },
    data: updatedData,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      avatarUrl: true,
      isActive: true,
      isVerified: true,
    },
  });

  if (email && temporaryToken) {
    const emailOptions = {
      email: user.email,
      subject: "Verify your email",
      mailgenContent: emailReverificationMailgenContent(
        user.name,
        `${process.env.BASE_URL}/api/v1/auth/verify/${temporaryToken.unHashedToken}`,
      ),
    };

    await sendEmail(emailOptions);
  }

  res.status(200).json(
    new ApiResponse(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl,
        isActive: user.isActive,
        isVerified: user.isVerified,
      },
      "User profile updated",
    ),
  );
});

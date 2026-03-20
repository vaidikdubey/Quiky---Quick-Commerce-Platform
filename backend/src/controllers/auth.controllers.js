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


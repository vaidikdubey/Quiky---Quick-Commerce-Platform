import { db } from "../db/db.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import jwt from "jsonwebtoken";
import { cookieOptions } from "../utils/constants.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generate-tokens.js";

export const isLoggedIn = asyncHandler(async (req, res, next) => {
  //get access token & refresh token from req.cookie()
  //if no access token && refresh token -> return res
  //if found -> verify access token
  //if valid -> next
  //if invalid -> match refresh token
  //if valid -> generate and store new access and refresh tokens -> next()
  //attach req.user() before any next()
  //if invalid -> return unauthorised response

  const { accessToken, refreshToken } = req.cookies;

  if (!accessToken && !refreshToken) throw new ApiError(401, "Unauthorized");

  if (accessToken) {
    try {
      const decodedToken = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET,
      );

      const user = await db.user.findUnique({
        where: {
          id: decodedToken.id,
        },
        select: {
          id: true,
          name: true,
          role: true,
          image: true,
        },
      });

      if (!user) throw new ApiError(404, "User not found");

      req.user = user;

      return next();
    } catch (error) {
      console.log("Access token expired/invalid, checking refresh token...");
    }
  }

  if (refreshToken) {
    try {
      const decodedToken = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
      );

      const user = await db.user.findUnique({
        where: {
          id: decodedToken.id,
        },
        select: {
          id: true,
          name: true,
          phone: true,
          role: true,
          refreshToken: true,
        },
      });

      if (!user || refreshToken !== user.refreshToken)
        throw new ApiError(401, "Unauthorized");

      const newAccessToken = generateAccessToken({ id: user.id });
      const newRefreshToken = generateRefreshToken({
        id: user.id,
        role: user.role,
      });

      await db.user.update({
        where: {
          id: user.id,
        },
        data: {
          refreshToken: newRefreshToken,
        },
      });

      res.cookie("accessToken", newAccessToken, cookieOptions);

      const refreshTokenCookieOptions = {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, //7days
      };

      res.cookie("refreshToken", newRefreshToken, refreshTokenCookieOptions);

      req.user = {
        id: user.id,
        name: user.name,
        role: user.role,
        image: user.image,
      };

      return next();
    } catch (error) {
      console.error("Error: ", error);
      throw new ApiError(401, "Unauthorized");
    }
  }
});

export const checkAdmin = asyncHandler(async (req, res, next) => {
  const user = req.user;

  if (!user || user.role !== "ADMIN")
    throw new ApiError(
      403,
      "Access denied - You don't have access to this resource",
    );

  return next();
});

export const checkPermission = (roles = []) =>
  asyncHandler(async (req, res, next) => {
    const user = req.user;

    if (!user || !roles.includes(user.role)) {
      throw new ApiError(
        403,
        "Access denied - You don't have access to this resource",
      );
    }

    return next();
  });

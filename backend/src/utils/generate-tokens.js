import jwt from "jsonwebtoken";
import crypto from "crypto";

export const generateAccessToken = function (payload) {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
};

export const generateRefreshToken = function (payload) {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};

export const generateTemporaryToken = function () {
  const unHashedToken = crypto.randomBytes(20).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");

  let tokenExpiry = Date.now() + 20 * 60 * 60; //20 mins

  tokenExpiry = new Date(tokenExpiry);

  return { unHashedToken, hashedToken, tokenExpiry };
};

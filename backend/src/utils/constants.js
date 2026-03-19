export const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  partitioned: true,
  maxAge: 15 * 60 * 1000, //15min
};

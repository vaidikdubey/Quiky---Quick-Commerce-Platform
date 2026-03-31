import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? process.env.BASE_URL,
    credentials: true,
    methods: ["GET", "POST", "OPTIONS", "DELETE", "PATCH", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization", "Content-Disposition"],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//import custom routes
import authRouter from "./routes/auth.routes.js";
import storeRouter from "./routes/store.route.js";

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/store", storeRouter);

// Any error thrown in routes above will end up here
app.use(errorHandler);

export default app;

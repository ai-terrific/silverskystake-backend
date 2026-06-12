import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import http from "http";
import morgan from "morgan";
import dotenv from "dotenv";
import chalk from "chalk";

import userRoutes from "./routes/user";
import postRoutes from "./routes/post";
import { MONGO_URI, PORT } from "./config";
import { errorHandler } from "./middlewares/errorHandler";

dotenv.config();

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(chalk.bgGreen("Connected to mongoDB..."));
  })
  .catch((err) => console.log(err));

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(morgan("dev"));

app.use(errorHandler);

app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes);

const server = http.createServer(app);

server.listen(PORT, () =>
  console.log(chalk.yellow(`Server is running on port ${PORT}`)),
);

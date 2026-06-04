import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import http from "http";
import dotenv from "dotenv";
import chalk from "chalk";

import userRoutes from "./routes/user";
import postRoutes from "./routes/post";

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI || "")
  .then(() => {
    console.log(chalk.bgGreen("Connected to mongoDB..."));
  })
  .catch((err) => console.log(err));

const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({ origin: true, credentials: true }));

app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes);

const port = process.env.PORT || 8001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors());

let server = http.createServer(app);

server.listen(port, () =>
  console.log(chalk.yellow(`Server is running on port ${port}`)),
);

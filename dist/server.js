import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import http from "http";
// import * as userController from "./controllers/user";
const port = 8080;
let app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
mongoose
    .connect("mongodb+srv://christianrichardson:Icandoit2024%40)%40$@cluster0.gvijnco.mongodb.net/myDB")
    .then(() => console.log("DB Connected"))
    .catch((err) => console.log(err));
// app.post("/add", userController.addUser);
app.get("/", (req, res) => {
    res.send({ a: 1 });
});
let server = http.createServer(app);
server.listen(port, () => console.log(`Server is running on port ${port}`));

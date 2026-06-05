"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
const chalk_1 = __importDefault(require("chalk"));
const user_1 = __importDefault(require("./routes/user"));
const post_1 = __importDefault(require("./routes/post"));
dotenv_1.default.config();
mongoose_1.default
    .connect(process.env.MONGO_URI || "")
    .then(() => {
    console.log(chalk_1.default.bgGreen("Connected to mongoDB..."));
})
    .catch((err) => console.log(err));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use((0, cors_1.default)({ origin: true, credentials: true }));
app.use("/api/user", user_1.default);
app.use("/api/post", post_1.default);
const port = process.env.PORT || 8001;
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use((0, cors_1.default)());
let server = http_1.default.createServer(app);
server.listen(port, () => console.log(chalk_1.default.yellow(`Server is running on port ${port}`)));

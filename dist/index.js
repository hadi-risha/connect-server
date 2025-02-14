"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
require("./auth/passport");
const authRoutes_1 = __importDefault(require("./routes/userRoutes/authRoutes"));
const studentRoutes_1 = __importDefault(require("./routes/userRoutes/studentRoutes"));
const instructorRoutes_1 = __importDefault(require("./routes/userRoutes/instructorRoutes"));
const routes_1 = __importDefault(require("./routes/adminRoutes/routes"));
const config_1 = __importDefault(require("./config/config"));
const morgan_1 = __importDefault(require("morgan"));
const logger_1 = __importDefault(require("./utils/logger"));
const httpStatusCodes_1 = require("./utils/httpStatusCodes");
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
require("./utils/logCleaner");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const db_1 = __importDefault(require("./config/db"));
const imagekit_1 = __importDefault(require("imagekit"));
(0, db_1.default)();
const app = (0, express_1.default)();
app.use((0, express_session_1.default)({
    secret: config_1.default.googleClientSecret || 'randomsecretkey76757',
    resave: false,
    saveUninitialized: false,
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
const corsOptions = {
    origin: config_1.default.frontendUrl,
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use((0, helmet_1.default)()); //for req safety
app.use(helmet_1.default.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use((0, morgan_1.default)('combined', { stream: { write: (message) => logger_1.default.info(message.trim()) } }));
app.use(express_1.default.json({ limit: '30mb' }));
app.use(express_1.default.urlencoded({ limit: '30mb', extended: true }));
app.use((0, cookie_parser_1.default)());
// store ai related images
const imagekit = new imagekit_1.default({
    urlEndpoint: config_1.default.imageKitEndpoint,
    publicKey: config_1.default.imageKitPublicKey,
    privateKey: config_1.default.imageKitPrivateKey,
});
app.get("/api/ai/upload", (req, res) => {
    try {
        const result = imagekit.getAuthenticationParameters();
        console.log("result in server ai uploads :- ", result);
        res.status(200).send(result);
    }
    catch (error) {
        console.error("Error getting authentication parameters(ai image):- ", error);
        res.status(500).send({ error: "Internal Server Error" });
    }
});
/* ROUTES */
app.use('/api/auth', authRoutes_1.default);
app.use("/api/student", studentRoutes_1.default);
app.use("/api/instructor", instructorRoutes_1.default);
app.use('/api/admin', routes_1.default);
/* CONNECT TO MONGODB */
console.log("mongoUrl...", config_1.default.mongoUrl);
if (!config_1.default.mongoUrl) {
    throw new Error("MONGO_URL environment variable is not defined");
}
app.get('/', (req, res) => {
    res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: "hello from home", text: "hlo world" });
});
const server = app.listen(config_1.default.port, () => {
    // console.log(`Server running at: http://${config.host}:${config.port}`);
    console.log(`Server running at: http://localhost:${config_1.default.port}`);
});
// const server = app.listen(config.port, '0.0.0.0', () => {
//     console.log(`Server running at: http://localhost:${config.port}`);
// });
const io = require("socket.io")(server, {
    pingTimeout: 60000,
    cors: {
        origin: `${config_1.default.frontendUrl}`,
        // credentials: true,
    },
});
const connectedUsers = {};
io.on("connection", (socket) => {
    console.log("Connected to socket.io");
    // console.log("socket itself", socket);
    console.log('New client connected:', socket.id);
    // socket.on("setup", (userData) => {
    //     console.log("2222");
    //     console.log("userData._id in socketio*** :- ", userData._id);     
    //     socket.join(userData._id);
    //     socket.emit("connected");
    // });
    socket.on("setup", (userData) => {
        console.log("userData in socketio", userData);
        socket.join(userData._id);
        socket.emit("connected");
    });
    // when click a chat this will create a particular room for all users
    socket.on("join chat", (room) => {
        socket.join(room);
        console.log("User Joined Room: " + room); //shows chatid
    });
    // socket.on("typing", (room: string) => {
    //   socket.in(room).emit("typing");
    //   console.log("user typing");
    // });
    // socket.on("stop typing", (room: string) => {
    //   socket.in(room).emit("stop typing")
    //   console.log("stopped typing");
    // });
    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));
    socket.on("new message", (newMessageRecieved) => {
        // console.log(" newMessageRecieved.chatId", newMessageRecieved.chat); 
        console.log(" newMessageRecieved.senderId", newMessageRecieved.sender);
        let chat = newMessageRecieved.chat;
        if (!chat.users)
            return console.log("chat.users not defined");
        chat.users.forEach((user) => {
            console.log("each user :- ", user);
            if (user._id == newMessageRecieved.sender._id)
                return;
            socket.in(user._id).emit("message recieved", newMessageRecieved); //by taking the obj in frontend we compare does the currectly actived chat is this or not, and so on
            console.log("message sent to", user === null || user === void 0 ? void 0 : user.firstName, user === null || user === void 0 ? void 0 : user.lastName);
        });
    });
    socket.off("setup", (userData) => {
        console.log("USER DISCONNECTED");
        socket.leave(userData._id);
    });
});
app.use(errorHandler_1.default);
// npm start  (development)
// npm run lint

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
require("./auth/passport");
const mongoose_1 = __importDefault(require("mongoose"));
const authRoutes_1 = __importDefault(require("./routes/userRoutes/authRoutes"));
const studentRoutes_1 = __importDefault(require("./routes/userRoutes/studentRoutes"));
const instructorRoutes_1 = __importDefault(require("./routes/userRoutes/instructorRoutes"));
const authRoutes_2 = __importDefault(require("./routes/adminRoutes/authRoutes"));
const config_1 = __importDefault(require("./config/config"));
const morgan_1 = __importDefault(require("morgan"));
const logger_1 = __importDefault(require("./utils/logger"));
const httpStatusCodes_1 = require("./utils/httpStatusCodes");
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
require("./utils/logCleaner");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
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
app.use(body_parser_1.default.json({ limit: '30mb' }));
app.use(body_parser_1.default.urlencoded({ limit: '30mb', extended: true }));
app.use((0, cookie_parser_1.default)());
/* ROUTES */
app.use('/api/auth', authRoutes_1.default);
app.use("/api/student", studentRoutes_1.default);
app.use("/api/instructor", instructorRoutes_1.default);
app.use('/api/admin', authRoutes_2.default);
/* CONNECT TO MONGODB */
console.log("mongoUrl...", config_1.default.mongoUrl);
if (!config_1.default.mongoUrl) {
    throw new Error("MONGO_URL environment variable is not defined");
}
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(config_1.default.mongoUrl);
        console.log('MongoDB connected');
        app.listen(config_1.default.port, () => console.log(`Server running at: http://${config_1.default.host}:${config_1.default.port}`));
    }
    catch (err) {
        console.error('MongoDB connection error:', err);
    }
});
connectDB();
app.get('/', (req, res) => {
    console.log('Received request at /');
    res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: "hello from home", text: "hlo prr" });
});
app.use(errorHandler_1.default);
// npx tsc , nodemon dist/index.js
// npm run lint

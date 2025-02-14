import express, { Express } from 'express';
import cors from 'cors';
import helmet from "helmet";
import session from 'express-session';
import passport from 'passport';
import './auth/passport';
import userRoutes from './routes/userRoutes/authRoutes';
import studentRoutes from './routes/userRoutes/studentRoutes';
import instructorRoutes from './routes/userRoutes/instructorRoutes';
import adminRoutes from './routes/adminRoutes/routes';
import config from './config/config';
import morgan from 'morgan';
import logger from './utils/logger';
import { HttpStatus } from './utils/httpStatusCodes';
import errorHandler from './middleware/errorHandler';
import './utils/logCleaner';
import cookieParser from 'cookie-parser';
import { Socket } from "socket.io";
import connectDB from './config/db'
import ImageKit from "imagekit";


connectDB();
const app: Express = express();

app.use(
  session({
      secret: config.googleClientSecret || 'randomsecretkey76757',
      resave: false,
      saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

const corsOptions = {
    origin: config.frontendUrl, 
    credentials: true, 
};

app.use(cors(corsOptions));
app.use(express.json());

app.use(helmet());   //for req safety
app.use(helmet.crossOriginResourcePolicy({policy: "cross-origin"}));

app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ limit: '30mb', extended: true }));

app.use(cookieParser());

// store ai related images
const imagekit = new ImageKit({
  urlEndpoint: config.imageKitEndpoint,
  publicKey: config.imageKitPublicKey,
  privateKey: config.imageKitPrivateKey,
});


app.get("/api/ai/upload", (req, res) => {
  try {
    const result = imagekit.getAuthenticationParameters();
    console.log("result in server ai uploads :- ", result);
    res.status(200).send(result);
  } catch (error) {
    console.error("Error getting authentication parameters(ai image):- ", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

/* ROUTES */
app.use('/api/auth', userRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/instructor", instructorRoutes);
app.use('/api/admin',  adminRoutes); 


/* CONNECT TO MONGODB */
console.log("mongoUrl...", config.mongoUrl);
if (!config.mongoUrl) {
    throw new Error("MONGO_URL environment variable is not defined");
}

app.get('/', (req, res) => {
  res.status(HttpStatus.OK).json({ message: "hello from home", text: "hlo world" });
});

const server = app.listen(
    config.port, () => {
    // console.log(`Server running at: http://${config.host}:${config.port}`);
    console.log(`Server running at: http://localhost:${config.port}`);
});

// const server = app.listen(config.port, '0.0.0.0', () => {
//     console.log(`Server running at: http://localhost:${config.port}`);
// });

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
      origin: `${config.frontendUrl}`,
    
    // credentials: true,
  },
});

// move to interfaces
interface User {
  _id: string;
  firstName: string;
  lastName: string;
}

const connectedUsers: { [key: string]: string[] } = {};
io.on("connection", (socket: Socket) => {
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
    socket.on("join chat", (room: string) => {
        socket.join(room);
        console.log("User Joined Room: " + room);  //shows chatid
    });

    // socket.on("typing", (room: string) => {
    //   socket.in(room).emit("typing");
    //   console.log("user typing");
    // });
    // socket.on("stop typing", (room: string) => {
    //   socket.in(room).emit("stop typing")
    //   console.log("stopped typing");
    // });
    socket.on("typing", (room: string) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room: string) => socket.in(room).emit("stop typing"));


    socket.on("new message", (newMessageRecieved) => { 
        // console.log(" newMessageRecieved.chatId", newMessageRecieved.chat); 
        console.log(" newMessageRecieved.senderId", newMessageRecieved.sender); 

        let chat = newMessageRecieved.chat;
        
        if (!chat.users) return console.log("chat.users not defined");
        
        chat.users.forEach((user: User) => {
          console.log("each user :- ", user);

          if (user._id == newMessageRecieved.sender._id) return;
          socket.in(user._id).emit("message recieved", newMessageRecieved); //by taking the obj in frontend we compare does the currectly actived chat is this or not, and so on

          
          console.log("message sent to", user?.firstName, user?.lastName);
        });
    });

    socket.off("setup", (userData) => {
        console.log("USER DISCONNECTED");
        socket.leave(userData._id);
    });
    
});


app.use(errorHandler);






// npm start  (development)
// npm run lint
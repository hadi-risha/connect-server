import { Request, Response } from 'express';
import { UserService } from '../services/userRepoService';
import { uploadImageToS3, deleteImageFromS3 } from '../utils/s3Service';
import config from '../config/config';
import bcrypt from 'bcryptjs'; 
import { HttpStatus } from '../utils/httpStatusCodes';
import mongoose from 'mongoose';
import { IInstructor, ISession } from '../models/sessionModel';
import { ChatModel, IChat } from '../models/chatModel';
// import { getReceiverSocketId, io } from '../utils/socket';
import { IPost, PostModel } from '../models/postModel';
import { UserModel } from '../models/userModel';
import { MessageModel } from '../models/messageModel';
import { AiChatModel } from '../models/aiChat';
import { AiUserChatsModel } from '../models/aiUserChats';
import { BookingModel } from '../models/bookingModel';
import AiRatingModel from '../models/aiRating';


interface IUserData {
    id: string;
    role: string;
}


export const fetchChats = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id, role } = req.userData as IUserData;
    console.log("User ID and Role:", id, role);

    return ChatModel.find({ users: { $elemMatch: { $eq: id } } })
      .populate("users", "_id firstName lastName email role image.url")
      .populate("groupAdmin", "_id firstName lastName email role image.url")
      .populate("latestMessage", "_id content createdAt")
      .sort({ updatedAt: -1 })
      .then(async (results: any) => {
        results = await UserModel.populate(results, {
          path: "latestMessage.sender",
          select: "_id firstName lastName email role image.url",
        });

        console.log("populatedResults in fetchchats :- ", results);

        return res.status(HttpStatus.OK).json({ message: "Chat list successfully fetched", chatList: results, });
      })
      .catch((error) => {
        console.error("Error fetching chats:", error.message);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: "An error occurred while accessing the chat list.",
        });
      });
  } catch (error: any) {
    console.error("Error accessing or creating chat:", error.message);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: "An error occurred while accessing the chat list.",
    });
  }
};



export const allUsers = async (req: Request, res: Response): Promise<Response> => {
  try {
    console.log('searcch query for chat header', req.query.search)
    const { id, role } = req.userData as IUserData;
    console.log("User ID and Role:", id, role);

    const keyword = req.query.search ? {
        $or: [
          { firstName: { $regex: req.query.search, $options: "i" } },
          { lastName: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};
    
    const users = await UserModel.find(keyword).find({ _id: { $ne: id } });
    console.log("users in allUsers------",users)
    return res.status(HttpStatus.OK).json({ message: "All users successfully fetched", users: users });
  } catch (error: any) {
    console.error("Error accessing or creating chat:", error.message);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while fetching all users." });
  }
};



//select a specific user to chat from the search
export const accessChat = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id, role } = req.userData as IUserData;
    console.log("User ID and Role:", id, role);

    const  chatPartnerId  = req.body.userId;
    console.log("Chat Partner ID:", chatPartnerId);

    if (!chatPartnerId) {
      console.log("Partner ID is missing");
      return res.status(HttpStatus.BAD_REQUEST).json({ message: "Partner ID is required to access chat." });
    }

    // Check if a chat already exists
    const existingChats = await ChatModel.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: id } } },
        { users: { $elemMatch: { $eq: chatPartnerId } } },
      ],
    })
      .populate("users", "_id firstName lastName email image.url")
      // .populate("latestMessage");

      console.log("existingChats-------1", existingChats);
      
    // Populate last message sender details
    const populatedChats = await UserModel.populate(existingChats, {
      path: "latestMessage.sender",
      select: "_id firstName lastName email image.url",
    });

    console.log("populatedChats---------==2", populatedChats);
    

    // Return existing chat if found
    if (populatedChats.length > 0) {

      console.log("populatedChats---3", populatedChats);
      console.log("populatedChats[0]  4", populatedChats[0]);  //actually this is not only a single user detaiols , its the wole chat and user details of both users
      
       return res.status(HttpStatus.OK).json({ message: "Chat found", chat: populatedChats[0] });
    }

    // Create a new chat if no existing chat
    const newChatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [id, chatPartnerId],
    };

    const createdChat = await ChatModel.create(newChatData);

    console.log("createdChat in search", createdChat)
    const fullChat = await ChatModel.findOne({ _id: createdChat._id })
    .populate(
      "users", 
      "_id firstName lastName email image.url"
    )

    console.log("fullchat in accessacht 5", fullChat)

    return res.status(HttpStatus.CREATED).json({ message: "New chat created successfully", chat: fullChat });
  } catch (error: any) {
    console.error("Error accessing or creating chat:", error.message);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while accessing or creating the chat." });
  }
};


export const sendMessage = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id, role } = req.userData as IUserData;
    console.log("User ID and Role:", id, role);

    const { content, chatId } = req.body;

    if (!content || !chatId) {
      console.log("Invalid data passed into request");
      return res.status(400).json({ message: "Invalid data passed into request" });
    }

    const newMessage = {
      sender: id,
      content,
      chat: chatId,
    };

    // Create the message
    let message: any = await MessageModel.create(newMessage);

    console.log("message in createMessage 1 :- ", message);
    

    if (!message) {
      console.log("Message not found after creation");
      return res.status(404).json({ message: "Message not found" });
    }

    message = await message.
              populate("sender", "_id firstName lastName email image.url role")  // new message also has a sender so fetch all details

    console.log("message (sender) in createMessage 2 :- ", message);


    // Populate the chat details and nested users within chat
    message = await message.populate({
      path: "chat",
      select: "_id users latestMessage isGroupChat chatName groupAdmin",
      populate: {
        path: "users",
        select: "_id firstName lastName email image.url role",
      },
    });

    console.log("message (chat), (chat.users) in createMessage 3 :- ", message);
              
    
    await ChatModel.findByIdAndUpdate(chatId, { latestMessage: message });

    return res
      .status(HttpStatus.OK)
      .json({ message: "Message successfully sent", messageData: message });
  } catch (error: any) {
    console.error("Error accessing or creating chat:", error.message);
    return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "An error occurred while sending the message." });
  }
};


export const allMessages = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id, role } = req.userData as IUserData;
    console.log("User ID and Role:", id, role);

    const messages = await MessageModel.find({ chat: req.params.chatId })
      .populate("sender", "_id firstName lastName email image.url")
      .populate("chat", "_id users latestMessage isGroupChat chatName groupAdmin");
    
    console.log("messages ---- all messages", messages);
    
    return res.status(HttpStatus.OK).json({ message: "All messages successfully fetched", messages: messages });
  } catch (error: any) {
    console.error("Error accessing or creating chat:", error.message);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while fetching all messages." });
  }
};




export const createGroupChat = async (req: Request, res: Response): Promise<Response> => {
  try {
    console.log("in group chat create");
    
    const { id, role } = req.userData as IUserData;
    console.log("User ID and Role:", id, role);

    if (!req.body.name) {
      return res.status(HttpStatus.BAD_REQUEST).send({ message: "Please Fill the name" });
    }

    // with or without students create a group(in instructor side)
    if (!req.body.users) {
      return res.status(HttpStatus.BAD_REQUEST).send({ message: "Please Fill all the feilds" });
    }
    console.log("req.body.name, req.body.users", req.body.name, req.body.users);

    var users = JSON.parse(req.body.users);

    if (users.length < 1) {
      console.log("need more than 1 users");
      
      return res
        .status(400)
        .send("More than 1 users are required to form a group chat");
    }

    users.push(id);

    const groupChat = await ChatModel.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: id,
    });
    console.log("groupChat created", groupChat);
    

    const fullGroupChat = await ChatModel.findOne({ _id: groupChat._id })
      .populate("users", "_id firstName lastName email image.url")
      .populate("groupAdmin", "_id firstName lastName email image.url");

      console.log("fullGroupChat--", fullGroupChat);

    
    return res.status(HttpStatus.OK).json({ message: "Group chat created successfully", fullGroupChat });
      
  } catch (error: any) {
    console.error("Error accessing or creating chat:", error.message);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while creating group chat." });
  }
};



export const renameGroup = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id, role } = req.userData as IUserData;
    console.log("User ID and Role:", id, role);

    const { chatId, chatName } = req.body;
    if (!chatName) {
      return res.status(HttpStatus.BAD_REQUEST).send({ message: "Please Fill the name" });
    }

    const updatedChat = await ChatModel.findByIdAndUpdate(
        chatId,
      {
        chatName: chatName,
      },
      {
        new: true,
      }
    )
    .populate("users", "_id firstName lastName email image.url")
    .populate("groupAdmin", "_id firstName lastName email image.url");

    console.log("updatedChat", updatedChat);

    if (!updatedChat) {
      res.status(HttpStatus.NOT_FOUND);
      throw new Error("Chat Not Found");
    } 

    return res.status(HttpStatus.OK).json({ message: "Group name updated successfully", updatedChat });
      
  } catch (error: any) {
    console.error("Error accessing or creating chat:", error.message);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while updating community name." });
  }
};


export const addToGroup = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id, role } = req.userData as IUserData;
    console.log("User ID and Role:", id, role);

    const { chatId, userId } = req.body;

    const added = await ChatModel.findByIdAndUpdate(
      chatId,
      {
        $push: { users: userId },
      },
      {
        new: true,
      }
    )
    .populate("users", "_id firstName lastName email image.url")
    .populate("groupAdmin", "_id firstName lastName email image.url");

    if (!added) {
      res.status(HttpStatus.NOT_FOUND);
      throw new Error("Chat Not Found");
    }

    return res.status(HttpStatus.OK).json({ message: "Successfully added user", added: added });
      
  } catch (error: any) {
    console.error("Error accessing or creating chat:", error.message);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while adding user." });
  }
};


export const removeFromGroup = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id, role } = req.userData as IUserData;
    console.log("User ID and Role:", id, role);

    const { chatId, userId } = req.body;

    const removed = await ChatModel.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userId },
      },
      {
        new: true,
      }
    )
    .populate("users", "_id firstName lastName email image.url")
    .populate("groupAdmin", "_id firstName lastName email image.url");

    if (!removed) {
      res.status(HttpStatus.NOT_FOUND);
      throw new Error("Chat Not Found");
    }

    return res.status(HttpStatus.OK).json({ message: "Successfully removed user from group", removed: removed });
      
  } catch (error: any) {
    console.error("Error accessing or creating chat:", error.message);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while removing user from community." });
  }
};




export const createAiChat = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id, role } = req.userData as IUserData;
    console.log("User ID and Role:", id, role);

    const { text } = req.body;

    const newChat = new AiChatModel({
      userId: id,
      history: [{ role: "user", parts: [{ text }] }],
    });

    console.log("newChat", newChat);

    const savedChat = await newChat.save();

     // CHECK IF THE USERCHATS EXISTS
    const userChats = await AiUserChatsModel.find({ userId: id });

    // IF DOESN'T EXIST CREATE A NEW ONE AND ADD THE CHAT IN THE CHATS ARRAY
    if (!userChats.length) {
      console.log("chats doenst exist so create a new chats");
      
      const newUserChats = new AiUserChatsModel({
        userId: id,
        chats: [
          {
            _id: savedChat._id,
            title: text.substring(0, 40),
          },
        ],
      });

      console.log("newUserChats", newUserChats);
      

      await newUserChats.save();
      return res.status(HttpStatus.CREATED).json({ message: "New Ai chat created successfully", newChatId: savedChat._id });

    }else {
      console.log("chats already exist so push id to chats");
      // IF EXISTS, PUSH THE CHAT TO THE EXISTING ARRAY
      await AiUserChatsModel.updateOne(
        { userId: id },
        {
          $push: {
            chats: {
              _id: savedChat._id,
              title: text.substring(0, 40),
            },
          },
        }
      );

      return res.status(HttpStatus.CREATED).json({ message: "New Ai chat created successfully",  newChatId: newChat._id});
    }
  } catch (error: any) {
    console.error("Error creating Ai chat:", error.message);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while creating the AI chat." });
  }
};


export const fetchAiChatlist = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id, role } = req.userData as IUserData;

    const userChats = await AiUserChatsModel.find({ userId: id });
    return res.status(HttpStatus.OK).json({ message: "User Ai chat list fetched successfully",  userChats: userChats[0].chats});
  } catch (error: any) {
    console.error("Error fetching Ai chatlist:", error.message);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while fetching the AI chat list." });
  }
};


export const fetchSingleAiChat = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id, role } = req.userData as IUserData;
    const chatId = req.params.id;

    console.log("chatId----==", chatId);
    
    const chat = await AiChatModel.findOne({ _id: chatId, userId: id });
    console.log("chat--------chat :-", chat);
    
    return res.status(HttpStatus.OK).json({ message: "User Ai chat fetched successfully",  chat: chat});

  } catch (error: any) {
    console.error("Error fetching Ai chat:", error.message);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while fetching the AI chat." });
  }
};


export const updateExistingAiChat = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id, role } = req.userData as IUserData;
    const chatId = req.params.id;
    
    console.log("chatId----==", chatId);

    const { question, answer, img } = req.body;

    console.log("question, answer, img", question, answer, img);
    

    const newItems = [
      ...(question
        ? [{ role: "user", parts: [{ text: question }], ...(img && { img }) }]
        : []),
      { role: "model", parts: [{ text: answer }] },
    ];

    const updatedChat = await AiChatModel.updateOne(
      { _id: chatId, userId: id },
      {
        $push: {
          history: {
            $each: newItems,
          },
        },
      },
      { new: true } 
    );
    
    return res.status(HttpStatus.OK).json({ message: "User Ai conversation added successfully",  updatedChat: updatedChat});

  } catch (error: any) {
    console.error("Error adding conversation:", error.message);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while adding conversation." });
  }
};



export const changePassword = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id, role } = req.userData as IUserData;

    // Destructure password and confirmPassword from the request body
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.status(400).json({ message: 'Password and Confirm Password are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (error: any) {
    console.error("Error fetching Ai chatlist:", error.message);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while reset password." });
  }
};



export const aiRating = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id, role } = req.userData as IUserData;
    const { rating } = req.body;
    
    if (rating < 1 || rating > 5) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: "Rating must be between 1 and 5." });
    }

    const newRating = new AiRatingModel({
      userId: id,  
      rating,
    });

    await newRating.save();

    return res.status(HttpStatus.CREATED).json({ message: "Rating submitted successfully!" });
  } catch (error: any) {
    console.error("Error creating rating:", error.message);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while creating the rating." });
  }
};


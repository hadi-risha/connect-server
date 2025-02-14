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
exports.aiRating = exports.changePassword = exports.updateExistingAiChat = exports.fetchSingleAiChat = exports.fetchAiChatlist = exports.createAiChat = exports.removeFromGroup = exports.addToGroup = exports.renameGroup = exports.createGroupChat = exports.allMessages = exports.sendMessage = exports.accessChat = exports.allUsers = exports.fetchChats = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const httpStatusCodes_1 = require("../utils/httpStatusCodes");
const chatModel_1 = require("../models/chatModel");
const userModel_1 = require("../models/userModel");
const messageModel_1 = require("../models/messageModel");
const aiChat_1 = require("../models/aiChat");
const aiUserChats_1 = require("../models/aiUserChats");
const aiRating_1 = __importDefault(require("../models/aiRating"));
const fetchChats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, role } = req.userData;
        console.log("User ID and Role:", id, role);
        return chatModel_1.ChatModel.find({ users: { $elemMatch: { $eq: id } } })
            .populate("users", "_id firstName lastName email role image.url")
            .populate("groupAdmin", "_id firstName lastName email role image.url")
            .populate("latestMessage", "_id content createdAt")
            .sort({ updatedAt: -1 })
            .then((results) => __awaiter(void 0, void 0, void 0, function* () {
            results = yield userModel_1.UserModel.populate(results, {
                path: "latestMessage.sender",
                select: "_id firstName lastName email role image.url",
            });
            console.log("populatedResults in fetchchats :- ", results);
            return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: "Chat list successfully fetched", chatList: results, });
        }))
            .catch((error) => {
            console.error("Error fetching chats:", error.message);
            return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: "An error occurred while accessing the chat list.",
            });
        });
    }
    catch (error) {
        console.error("Error accessing or creating chat:", error.message);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: "An error occurred while accessing the chat list.",
        });
    }
});
exports.fetchChats = fetchChats;
const allUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('searcch query for chat header', req.query.search);
        const { id, role } = req.userData;
        console.log("User ID and Role:", id, role);
        const keyword = req.query.search ? {
            $or: [
                { firstName: { $regex: req.query.search, $options: "i" } },
                { lastName: { $regex: req.query.search, $options: "i" } },
                { email: { $regex: req.query.search, $options: "i" } },
            ],
        }
            : {};
        const users = yield userModel_1.UserModel.find(keyword).find({ _id: { $ne: id } });
        console.log("users in allUsers------", users);
        return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: "All users successfully fetched", users: users });
    }
    catch (error) {
        console.error("Error accessing or creating chat:", error.message);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while fetching all users." });
    }
});
exports.allUsers = allUsers;
//select a specific user to chat from the search
const accessChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, role } = req.userData;
        console.log("User ID and Role:", id, role);
        const chatPartnerId = req.body.userId;
        console.log("Chat Partner ID:", chatPartnerId);
        if (!chatPartnerId) {
            console.log("Partner ID is missing");
            return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: "Partner ID is required to access chat." });
        }
        // Check if a chat already exists
        const existingChats = yield chatModel_1.ChatModel.find({
            isGroupChat: false,
            $and: [
                { users: { $elemMatch: { $eq: id } } },
                { users: { $elemMatch: { $eq: chatPartnerId } } },
            ],
        })
            .populate("users", "_id firstName lastName email image.url");
        // .populate("latestMessage");
        console.log("existingChats-------1", existingChats);
        // Populate last message sender details
        const populatedChats = yield userModel_1.UserModel.populate(existingChats, {
            path: "latestMessage.sender",
            select: "_id firstName lastName email image.url",
        });
        console.log("populatedChats---------==2", populatedChats);
        // Return existing chat if found
        if (populatedChats.length > 0) {
            console.log("populatedChats---3", populatedChats);
            console.log("populatedChats[0]  4", populatedChats[0]); //actually this is not only a single user detaiols , its the wole chat and user details of both users
            return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: "Chat found", chat: populatedChats[0] });
        }
        // Create a new chat if no existing chat
        const newChatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [id, chatPartnerId],
        };
        const createdChat = yield chatModel_1.ChatModel.create(newChatData);
        console.log("createdChat in search", createdChat);
        const fullChat = yield chatModel_1.ChatModel.findOne({ _id: createdChat._id })
            .populate("users", "_id firstName lastName email image.url");
        console.log("fullchat in accessacht 5", fullChat);
        return res.status(httpStatusCodes_1.HttpStatus.CREATED).json({ message: "New chat created successfully", chat: fullChat });
    }
    catch (error) {
        console.error("Error accessing or creating chat:", error.message);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while accessing or creating the chat." });
    }
});
exports.accessChat = accessChat;
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, role } = req.userData;
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
        let message = yield messageModel_1.MessageModel.create(newMessage);
        console.log("message in createMessage 1 :- ", message);
        if (!message) {
            console.log("Message not found after creation");
            return res.status(404).json({ message: "Message not found" });
        }
        message = yield message.
            populate("sender", "_id firstName lastName email image.url role"); // new message also has a sender so fetch all details
        console.log("message (sender) in createMessage 2 :- ", message);
        // Populate the chat details and nested users within chat
        message = yield message.populate({
            path: "chat",
            select: "_id users latestMessage isGroupChat chatName groupAdmin",
            populate: {
                path: "users",
                select: "_id firstName lastName email image.url role",
            },
        });
        console.log("message (chat), (chat.users) in createMessage 3 :- ", message);
        yield chatModel_1.ChatModel.findByIdAndUpdate(chatId, { latestMessage: message });
        return res
            .status(httpStatusCodes_1.HttpStatus.OK)
            .json({ message: "Message successfully sent", messageData: message });
    }
    catch (error) {
        console.error("Error accessing or creating chat:", error.message);
        return res
            .status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR)
            .json({ message: "An error occurred while sending the message." });
    }
});
exports.sendMessage = sendMessage;
const allMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, role } = req.userData;
        console.log("User ID and Role:", id, role);
        const messages = yield messageModel_1.MessageModel.find({ chat: req.params.chatId })
            .populate("sender", "_id firstName lastName email image.url")
            .populate("chat", "_id users latestMessage isGroupChat chatName groupAdmin");
        console.log("messages ---- all messages", messages);
        return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: "All messages successfully fetched", messages: messages });
    }
    catch (error) {
        console.error("Error accessing or creating chat:", error.message);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while fetching all messages." });
    }
});
exports.allMessages = allMessages;
const createGroupChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("in group chat create");
        const { id, role } = req.userData;
        console.log("User ID and Role:", id, role);
        if (!req.body.name) {
            return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).send({ message: "Please Fill the name" });
        }
        // with or without students create a group(in instructor side)
        if (!req.body.users) {
            return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).send({ message: "Please Fill all the feilds" });
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
        const groupChat = yield chatModel_1.ChatModel.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: id,
        });
        console.log("groupChat created", groupChat);
        const fullGroupChat = yield chatModel_1.ChatModel.findOne({ _id: groupChat._id })
            .populate("users", "_id firstName lastName email image.url")
            .populate("groupAdmin", "_id firstName lastName email image.url");
        console.log("fullGroupChat--", fullGroupChat);
        return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: "Group chat created successfully", fullGroupChat });
    }
    catch (error) {
        console.error("Error accessing or creating chat:", error.message);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while creating group chat." });
    }
});
exports.createGroupChat = createGroupChat;
const renameGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, role } = req.userData;
        console.log("User ID and Role:", id, role);
        const { chatId, chatName } = req.body;
        if (!chatName) {
            return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).send({ message: "Please Fill the name" });
        }
        const updatedChat = yield chatModel_1.ChatModel.findByIdAndUpdate(chatId, {
            chatName: chatName,
        }, {
            new: true,
        })
            .populate("users", "_id firstName lastName email image.url")
            .populate("groupAdmin", "_id firstName lastName email image.url");
        console.log("updatedChat", updatedChat);
        if (!updatedChat) {
            res.status(httpStatusCodes_1.HttpStatus.NOT_FOUND);
            throw new Error("Chat Not Found");
        }
        return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: "Group name updated successfully", updatedChat });
    }
    catch (error) {
        console.error("Error accessing or creating chat:", error.message);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while updating community name." });
    }
});
exports.renameGroup = renameGroup;
const addToGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, role } = req.userData;
        console.log("User ID and Role:", id, role);
        const { chatId, userId } = req.body;
        const added = yield chatModel_1.ChatModel.findByIdAndUpdate(chatId, {
            $push: { users: userId },
        }, {
            new: true,
        })
            .populate("users", "_id firstName lastName email image.url")
            .populate("groupAdmin", "_id firstName lastName email image.url");
        if (!added) {
            res.status(httpStatusCodes_1.HttpStatus.NOT_FOUND);
            throw new Error("Chat Not Found");
        }
        return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: "Successfully added user", added: added });
    }
    catch (error) {
        console.error("Error accessing or creating chat:", error.message);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while adding user." });
    }
});
exports.addToGroup = addToGroup;
const removeFromGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, role } = req.userData;
        console.log("User ID and Role:", id, role);
        const { chatId, userId } = req.body;
        const removed = yield chatModel_1.ChatModel.findByIdAndUpdate(chatId, {
            $pull: { users: userId },
        }, {
            new: true,
        })
            .populate("users", "_id firstName lastName email image.url")
            .populate("groupAdmin", "_id firstName lastName email image.url");
        if (!removed) {
            res.status(httpStatusCodes_1.HttpStatus.NOT_FOUND);
            throw new Error("Chat Not Found");
        }
        return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: "Successfully removed user from group", removed: removed });
    }
    catch (error) {
        console.error("Error accessing or creating chat:", error.message);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while removing user from community." });
    }
});
exports.removeFromGroup = removeFromGroup;
const createAiChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, role } = req.userData;
        console.log("User ID and Role:", id, role);
        const { text } = req.body;
        const newChat = new aiChat_1.AiChatModel({
            userId: id,
            history: [{ role: "user", parts: [{ text }] }],
        });
        console.log("newChat", newChat);
        const savedChat = yield newChat.save();
        // CHECK IF THE USERCHATS EXISTS
        const userChats = yield aiUserChats_1.AiUserChatsModel.find({ userId: id });
        // IF DOESN'T EXIST CREATE A NEW ONE AND ADD THE CHAT IN THE CHATS ARRAY
        if (!userChats.length) {
            console.log("chats doenst exist so create a new chats");
            const newUserChats = new aiUserChats_1.AiUserChatsModel({
                userId: id,
                chats: [
                    {
                        _id: savedChat._id,
                        title: text.substring(0, 40),
                    },
                ],
            });
            console.log("newUserChats", newUserChats);
            yield newUserChats.save();
            return res.status(httpStatusCodes_1.HttpStatus.CREATED).json({ message: "New Ai chat created successfully", newChatId: savedChat._id });
        }
        else {
            console.log("chats already exist so push id to chats");
            // IF EXISTS, PUSH THE CHAT TO THE EXISTING ARRAY
            yield aiUserChats_1.AiUserChatsModel.updateOne({ userId: id }, {
                $push: {
                    chats: {
                        _id: savedChat._id,
                        title: text.substring(0, 40),
                    },
                },
            });
            return res.status(httpStatusCodes_1.HttpStatus.CREATED).json({ message: "New Ai chat created successfully", newChatId: newChat._id });
        }
    }
    catch (error) {
        console.error("Error creating Ai chat:", error.message);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while creating the AI chat." });
    }
});
exports.createAiChat = createAiChat;
const fetchAiChatlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, role } = req.userData;
        const userChats = yield aiUserChats_1.AiUserChatsModel.find({ userId: id });
        return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: "User Ai chat list fetched successfully", userChats: userChats[0].chats });
    }
    catch (error) {
        console.error("Error fetching Ai chatlist:", error.message);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while fetching the AI chat list." });
    }
});
exports.fetchAiChatlist = fetchAiChatlist;
const fetchSingleAiChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, role } = req.userData;
        const chatId = req.params.id;
        console.log("chatId----==", chatId);
        const chat = yield aiChat_1.AiChatModel.findOne({ _id: chatId, userId: id });
        console.log("chat--------chat :-", chat);
        return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: "User Ai chat fetched successfully", chat: chat });
    }
    catch (error) {
        console.error("Error fetching Ai chat:", error.message);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while fetching the AI chat." });
    }
});
exports.fetchSingleAiChat = fetchSingleAiChat;
const updateExistingAiChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, role } = req.userData;
        const chatId = req.params.id;
        console.log("chatId----==", chatId);
        const { question, answer, img } = req.body;
        console.log("question, answer, img", question, answer, img);
        const newItems = [
            ...(question
                ? [Object.assign({ role: "user", parts: [{ text: question }] }, (img && { img }))]
                : []),
            { role: "model", parts: [{ text: answer }] },
        ];
        const updatedChat = yield aiChat_1.AiChatModel.updateOne({ _id: chatId, userId: id }, {
            $push: {
                history: {
                    $each: newItems,
                },
            },
        }, { new: true });
        return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: "User Ai conversation added successfully", updatedChat: updatedChat });
    }
    catch (error) {
        console.error("Error adding conversation:", error.message);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while adding conversation." });
    }
});
exports.updateExistingAiChat = updateExistingAiChat;
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, role } = req.userData;
        // Destructure password and confirmPassword from the request body
        const { password, confirmPassword } = req.body;
        if (!password || !confirmPassword) {
            return res.status(400).json({ message: 'Password and Confirm Password are required' });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }
        const user = yield userModel_1.UserModel.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
        // Update the user's password
        user.password = hashedPassword;
        yield user.save();
        return res.status(200).json({ message: 'Password changed successfully' });
    }
    catch (error) {
        console.error("Error fetching Ai chatlist:", error.message);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while reset password." });
    }
});
exports.changePassword = changePassword;
const aiRating = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, role } = req.userData;
        const { rating } = req.body;
        if (rating < 1 || rating > 5) {
            return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: "Rating must be between 1 and 5." });
        }
        const newRating = new aiRating_1.default({
            userId: id,
            rating,
        });
        yield newRating.save();
        return res.status(httpStatusCodes_1.HttpStatus.CREATED).json({ message: "Rating submitted successfully!" });
    }
    catch (error) {
        console.error("Error creating rating:", error.message);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while creating the rating." });
    }
});
exports.aiRating = aiRating;

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
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUserRole = void 0;
const httpStatusCodes_1 = require("../utils/httpStatusCodes");
const userRepoService_1 = require("../services/userRepoService");
const userService = new userRepoService_1.UserService();
const checkUserRole = (uRole) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.userData) {
            return res.status(httpStatusCodes_1.HttpStatus.FORBIDDEN).json({ message: 'No user data available' });
        }
        const { id, role, isBlocked, isRoleChanged } = req.userData;
        const existingProfile = yield userService.findUserById(id);
        if (!existingProfile) {
            return res.status(httpStatusCodes_1.HttpStatus.NOT_FOUND).json({ message: "User doesn't exist" });
        }
        if (existingProfile.isBlocked) {
            console.log("User account has been blocked");
            return res.status(httpStatusCodes_1.HttpStatus.FORBIDDEN).json({ message: "Your account has been blocked.", isBlocked: existingProfile.isBlocked });
        }
        if (existingProfile.isRoleChanged) {
            console.log("User role changed");
            const updateisRoleChanged = yield userService.updateIsRoleChanged(id); //change rolechanged to false
            return res.status(httpStatusCodes_1.HttpStatus.FORBIDDEN).json({ message: "Your role has been changed. Please log in again.", isRoleChanged: true });
        }
        if (typeof req.userData === 'object' && 'role' in req.userData) {
            const userRole = req.userData.role;
            if (role !== uRole) {
                return res.status(httpStatusCodes_1.HttpStatus.FORBIDDEN).json({ message: 'Access denied, insufficient permissions' });
            }
            if (isBlocked) {
                return res.status(httpStatusCodes_1.HttpStatus.FORBIDDEN).json({ message: 'Access denied: Your account has been temporarily blocked.' });
            }
        }
        else {
            return res.status(httpStatusCodes_1.HttpStatus.FORBIDDEN).json({ message: 'Invalid user data structure' });
        }
        next();
    });
};
exports.checkUserRole = checkUserRole;

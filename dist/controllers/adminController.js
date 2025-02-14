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
exports.AdminController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const adminTokenService_1 = require("../utils/adminTokenService");
const adminService_1 = require("../services/adminService");
const config_1 = __importDefault(require("../config/config"));
const httpStatusCodes_1 = require("../utils/httpStatusCodes");
class AdminController {
    constructor() {
        this.adminService = new adminService_1.AdminService();
    }
    /* ADMIN LOGGING IN */
    adminLogin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            console.log("admin login credentialss", email, password);
            try {
                if (!email || !password) {
                    return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: "All fields are required" });
                }
                let admin = yield this.adminService.findAdminByEmail(email);
                if (!admin) {
                    if (config_1.default.adminEmail === email && config_1.default.adminPass === password) {
                        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
                        admin = yield this.adminService.createAdmin({ email, password: hashedPassword });
                        console.log("First-time admin created successfully!");
                        const token = (0, adminTokenService_1.generateToken)(admin._id.toString());
                        return res.status(httpStatusCodes_1.HttpStatus.CREATED).json({ message: "Admin account created", token });
                    }
                    else {
                        return res.status(httpStatusCodes_1.HttpStatus.NOT_FOUND).json({ message: "Invalid credentials" });
                    }
                }
                const isMatch = yield bcryptjs_1.default.compare(password, admin.password);
                if (!isMatch) {
                    return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: "Invalid credentials" });
                }
                const token = (0, adminTokenService_1.generateToken)(admin._id.toString());
                return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: "Admin login successful", token });
            }
            catch (error) {
                return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
            }
        });
    }
    /* FETCH ALL USERS */
    fetchUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { isBlocked } = req.body;
            try {
                const users = yield this.adminService.fetchUsers();
                return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: "Sessions successfully fetched", users });
            }
            catch (error) {
                return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch users", error: error.message });
            }
        });
    }
    /* UPDATE BLOCK STATUS */
    toggleUserBlock(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { isBlocked } = req.body;
            if (typeof isBlocked !== 'boolean') {
                return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: 'Invalid block status. Expected a boolean value.' });
            }
            try {
                const user = yield this.adminService.updateUserBlockStatus(id, isBlocked);
                if (!user) {
                    return res.status(httpStatusCodes_1.HttpStatus.NOT_FOUND).json({ message: 'User not found.' });
                }
                return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: "User block status updated successfully.", user });
            }
            catch (error) {
                return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Failed to update block status", error: error.message });
            }
        });
    }
    switchUserRole(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, newRole } = req.body;
            try {
                const updatedUser = this.adminService.switchUserRole(id, newRole);
                console.log("updatedUser-----------", updatedUser);
                if (!updatedUser) {
                    return res.status(httpStatusCodes_1.HttpStatus.NOT_FOUND).json({ message: 'User not found.' });
                }
                return res.status(httpStatusCodes_1.HttpStatus.CREATED).json(Object.assign({ message: "User role updated successfully" }, updatedUser));
            }
            catch (error) {
                console.error("Error updating user role:", error);
                return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error updating user role:" });
            }
        });
    }
}
exports.AdminController = AdminController;
;

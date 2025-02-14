"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// import { adminLogin } from '../../controllers/admin_controller/auth.js'
const adminAuthMiddleware_js_1 = require("../../middleware/adminAuthMiddleware.js");
const adminController_js_1 = require("../../controllers/adminController.js");
const router = express_1.default.Router();
const adminController = new adminController_js_1.AdminController();
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
/* ADMIN ROUTES */
router.post('/login', asyncHandler(adminController.adminLogin.bind(adminController)));
router.get("/home", adminAuthMiddleware_js_1.adminAuthMiddleware, (req, res) => {
    res.json({ message: "Welcome Admin!" });
});
router.get('/users', adminAuthMiddleware_js_1.adminAuthMiddleware, asyncHandler(adminController.fetchUsers.bind(adminController)));
router.patch('/user/block/:id', adminAuthMiddleware_js_1.adminAuthMiddleware, asyncHandler(adminController.toggleUserBlock.bind(adminController)));
// router.post('/switch-role', adminAuthMiddleware,  asyncHandler(switchUserRole));  
router.post('/switch-role', adminAuthMiddleware_js_1.adminAuthMiddleware, asyncHandler(adminController.switchUserRole.bind(adminController)));
exports.default = router;

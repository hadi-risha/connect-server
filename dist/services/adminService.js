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
exports.AdminService = void 0;
// src/services/adminService.ts
const adminRepository_1 = require("../repositories/adminRepository");
class AdminService {
    constructor() {
        this.adminRepository = new adminRepository_1.AdminRepository();
    }
    createAdmin(adminData) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.adminRepository.createAdmin(adminData);
        });
    }
    findAdminByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.adminRepository.findAdminByEmail(email);
        });
    }
    fetchUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.adminRepository.fetchUsers();
        });
    }
    updateUserBlockStatus(id, isBlocked) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.adminRepository.updateUserBlockStatus(id, isBlocked);
        });
    }
    switchUserRole(id, newRole) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.adminRepository.switchUserRole(id, newRole);
        });
    }
}
exports.AdminService = AdminService;

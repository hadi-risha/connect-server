// src/services/adminService.ts
import { AdminRepository } from '../repositories/adminRepository';
import { IAdmin } from '../interfaces/adminRepoInterface';
import { IUser } from '../models/userModel';
import { INotification } from '../models/notificationModel';

export class AdminService {
    private adminRepository: AdminRepository;

    constructor() {
        this.adminRepository = new AdminRepository();
    }

    async createAdmin(adminData: Partial<IAdmin>): Promise<IAdmin> {
        return this.adminRepository.createAdmin(adminData);
    }

    async findAdminByEmail(email: string): Promise<IAdmin | null> {
        return this.adminRepository.findAdminByEmail(email);
    }

    async fetchUsers(): Promise<IUser[] | null> {
        return this.adminRepository.fetchUsers();
    }

    async updateUserBlockStatus(id: string, isBlocked: boolean): Promise<IUser | null> {
        return this.adminRepository.updateUserBlockStatus(id, isBlocked);
    }

    async switchUserRole(id: string, newRole: string): Promise<IUser> {
        return this.adminRepository.switchUserRole(id, newRole)
    }

    async createNotification(notificationData: Partial<INotification>): Promise<INotification | null> {
        return this.adminRepository.createNotification(notificationData)
    }


    async updateNotification(id: string, notificationData: Partial<INotification>): Promise<INotification | null> {
        return this.adminRepository.updateNotification(id, notificationData)
    }

    async updateNotificationStatus(id: string, isShown: boolean): Promise<INotification | null> {
        return this.adminRepository.updateNotificationStatus(id, isShown)
    }

    async deleteNotification(id: string): Promise<INotification | null> {
        return this.adminRepository.deleteNotification(id)
    }

    async getNotifications(): Promise<INotification[] | null> {
        return this.adminRepository.getNotifications()
    }

    async getNotification(id: string): Promise<INotification | null> {
        return this.adminRepository.getNotification(id)
    }
}

import { IAdmin, IAdminRepository } from '../interfaces/adminRepoInterface';
import { Admin } from '../models/adminModel';
import { INotification, NotificationModel } from '../models/notificationModel';
import { IUser, UserModel } from '../models/userModel';

export class AdminRepository implements IAdminRepository {

    async createAdmin(adminData: Partial<IAdmin>): Promise<IAdmin> {
        try {
            const newAdmin = new Admin(adminData);
            return await newAdmin.save() as IAdmin;
        } catch (error) {
            throw new Error(`Error creating admin: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    
    async findAdminByEmail(email: string): Promise<IAdmin | null> {
        try {
            return await Admin.findOne({ email });
        } catch (error) {
            throw new Error(`Error finding admin by email: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async fetchUsers(): Promise<IUser[] | null> {
        try {
            return await UserModel.find().sort({ createdAt: -1 })
        } catch (error) {
            throw new Error(`Failed to fetch users: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async updateUserBlockStatus(id: string, isBlocked: boolean): Promise<IUser | null> {
        try {
            return await UserModel.findByIdAndUpdate(id, { isBlocked }, { new: true }); // The { new: true } option returns the updated document
        } catch (error) {
            throw new Error(`Failed to update user block status: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }


    async switchUserRole(id: string, newRole: string): Promise<IUser> {
        try {
            console.log("in admin update user role repository");
            const updatedUser = await UserModel.findByIdAndUpdate(id, { role: newRole, isRoleChanged: true },{ new: true }).exec();
        
            if (!updatedUser) {
                console.log("User not found");
                throw new Error("User not found");
            }
            return updatedUser;
        } catch (error) {
            throw new Error(`Error updating user role: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }


    async createNotification( notificationData: Partial<INotification> ): Promise<INotification | null> {
        try {
            const notification = new NotificationModel({
                ...notificationData, // Spread notification data
            });
            await notification.save();

            return notification;
        } catch (error) {
            throw new Error(`Error creating notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }


    async updateNotification( id: string, notificationData: Partial<INotification> ): Promise<INotification | null> {
        try {
            const notification = await NotificationModel.findByIdAndUpdate(
                id,
                notificationData, 
                { new: true } 
            );
            return notification;
        } catch (error) {
            throw new Error(`Error updating notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async updateNotificationStatus(id: string, isShown: boolean): Promise<INotification | null> {
        try {
          // Fetch and update the notification
          const notification = await NotificationModel.findByIdAndUpdate(
            id,
            { isShown: isShown },  // Correct object syntax for updating
            { new: true } // Ensures the updated document is returned
          );
      
          return notification;
        } catch (error) {
          throw new Error(`Error updating notification status: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    

    async deleteNotification( id: string ): Promise<INotification | null> {
        try {
            const notification = await NotificationModel.findByIdAndDelete(id);
            return notification;
        } catch (error) {
            throw new Error(`Error deleting notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getNotifications(): Promise<INotification[] | null> {
        try {
            return await NotificationModel.find().sort({ createdAt: -1 })
        } catch (error) {
            throw new Error(`Failed to fetch notifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }


    async getNotification(id: string): Promise<INotification | null> {
        try {
            const notification = await NotificationModel.findById(id);
            if (!notification) {
                return null; 
            }
            return notification;
        } catch (error) {
            throw new Error(`Failed to fetch notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

}

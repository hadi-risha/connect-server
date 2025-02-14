import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/adminTokenService";
import { AdminService } from '../services/adminRepoService';
import config from "../config/config";
import { HttpStatus } from '../utils/httpStatusCodes';
import AiRatingModel from "../models/aiRating";
import { ChatModel } from "../models/chatModel";
import { UserModel } from "../models/userModel";





export class AdminController {
  private adminService: AdminService;

  constructor() {
      this.adminService = new AdminService();
  }




  /* ADMIN LOGGING IN */
  public async adminLogin(req: Request, res: Response) {
    const { email, password } = req.body;

    console.log("admin login credentialss", email, password);
    try {
      if (!email || !password) {
          return res.status(HttpStatus.BAD_REQUEST).json({ message: "All fields are required" });
        }

      let admin = await this.adminService.findAdminByEmail(email);
      
      if (!admin) {
          if (config.adminEmail === email && config.adminPass === password) {
            const hashedPassword = await bcrypt.hash(password, 10);

            admin = await this.adminService.createAdmin({ email, password: hashedPassword });
            console.log("First-time admin created successfully!");
    
            const token = generateToken(admin._id.toString());
            return res.status(HttpStatus.CREATED).json({ message: "Admin account created", token });
          } else {
            return res.status(HttpStatus.NOT_FOUND).json({ message: "Invalid credentials" });
          }
        }

      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: "Invalid credentials" });
      }

      const token = generateToken(admin._id.toString());
      return res.status(HttpStatus.OK).json({ message: "Admin login successful", token });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
  }


  /* FETCH ALL USERS */
  public async fetchUsers(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const { isBlocked } = req.body;
    try {
      const users = await this.adminService.fetchUsers();
      return res.status(HttpStatus.OK).json({ message: "Sessions successfully fetched", users });
    } catch (error:any) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch users",error: error.message});

    }
  }



   /* UPDATE BLOCK STATUS */
   public async toggleUserBlock(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const { isBlocked } = req.body;

    if (typeof isBlocked !== 'boolean') {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Invalid block status. Expected a boolean value.' });
    }


    try {
      const user = await this.adminService.updateUserBlockStatus(id, isBlocked);
      if (!user) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'User not found.' });
      }

      return res.status(HttpStatus.OK).json({ message: "User block status updated successfully.", user });
    } catch (error:any) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Failed to update block status",error: error.message});

    }
  }



  public async switchUserRole(req: Request, res: Response): Promise<Response> {
    const { id, newRole } = req.body;
    try {
      const updatedUser = this.adminService.switchUserRole(id, newRole)
      console.log("updatedUser-----------", updatedUser);

      if (!updatedUser) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'User not found.' });
      }
      
      return res.status(HttpStatus.CREATED).json({ message: "User role updated successfully", ...updatedUser });
    } catch (error) {
      console.error("Error updating user role:", error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error updating user role:" });
    }
  }



  public async createNotification(req: Request, res: Response): Promise<Response> {
    try {
      const { title, message,  } = req.body;
      const notificationData = { title, message };

      const newNotification = await this.adminService.createNotification(notificationData)
      return res.status(HttpStatus.CREATED).json({ message: "Notification created successfully", newNotification,});
    } catch (error) {
      console.error("Error creating notification:", error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error creating notification:" });
    }
  }





  public async updateNotification(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { title, message } = req.body;

      const notificationData = { title, message };

      const updatedNotification = await this.adminService.updateNotification(id, notificationData);


      return res.status(HttpStatus.OK).json({ message: "Notification updated successfully", updatedNotification,});
    } catch (error) {
      console.error("Error updating user role:", error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error updating notification:" });
    }
  }


  public async updateNotificationStatus(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const {isShown} = req.body;
      
      const updatedNotification = await this.adminService.updateNotificationStatus(id, isShown);


      return res.status(HttpStatus.OK).json({ message: "Notification updated successfully", updatedNotification,});
    } catch (error) {
      console.error("Error updating user role:", error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error updating notification:" });
    }
  }


  public async deleteNotification(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const deleted = await this.adminService.deleteNotification(id);

      if (!deleted) {
        // If no notification was found and deleted
        return res.status(HttpStatus.NOT_FOUND).json({ message: "Notification not found" });
      }
      return res.status(HttpStatus.NO_CONTENT).json({ message: "Notification deleted successfully"});
    } catch (error) {
      console.error("Error updating user role:", error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error deleting notification:" });
    }
  }


  public async getNotifications(req: Request, res: Response): Promise<Response> {
    try {
      const notifications = await this.adminService.getNotifications();

      return res.status(HttpStatus.OK).json({ message: "Notifications fetched successfully", notifications,});
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error fetching notifications:" });
    }
  }

  public async getNotification(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const notification = await this.adminService.getNotification(id);
      if (!notification) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: "Notification not found" });
      }

      return res.status(HttpStatus.OK).json({ message: "Notification fetched successfully", notification,});
    } catch (error) {
      console.error("Error fetching notification:", error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error fetching notification:" });
    }
  }




  public async getAiRatings(req: Request, res: Response): Promise<Response> {
    try {
      // Fetch all AI ratings in descending order of `createdAt`
      const aiRatings = await AiRatingModel.find().populate("userId", "firstName lastName email role image.url").sort({ createdAt: -1 });

      return res.status(HttpStatus.OK).json({ message: "AI Ratings fetched successfully", aiRatings,});
    } catch (error) {
      console.error("Error fetching AI ratings:", error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error fetching AI ratings",});
    }
  }



  public async getCommunities(req: Request, res: Response): Promise<Response> {
    try {
      // Fetch all group chats and populate admin + user details
      const communityChats = await ChatModel.find({ isGroupChat: true })
        .populate("groupAdmin", "_id firstName lastName email image.url") // Fetch admin details
        .populate("users", "_id firstName lastName email image.url") // Fetch all users' details
        .sort({ createdAt: -1 });

      return res.status(HttpStatus.OK).json({
        message: "Community chats fetched successfully",
        communityChats,
      });
    } catch (error) {
      console.error("Error fetching community chats:", error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: "Error fetching community chats",
      });
    }
  }


  public async deleteCommunity(req: Request, res: Response): Promise<Response> {
    try {
        const { groupId } = req.params;

        // Find and delete the group
        const deletedCommunity = await ChatModel.findByIdAndDelete(groupId);

        if (!deletedCommunity) {
            return res.status(HttpStatus.NOT_FOUND).json({
                message: "Community not found",
            });
        }

        return res.status(HttpStatus.OK).json({
            message: "Community deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting community:", error);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: "Error deleting community",
        });
    }
  }





public async removeUserFromCommunity(req: Request, res: Response): Promise<Response> {
    try {
        const { groupId, userId } = req.params;

        // Find the group chat
        const community = await ChatModel.findById(groupId);
        if (!community) {
            return res.status(HttpStatus.NOT_FOUND).json({
                message: "Community not found",
            });
        }

        // Check if the user is part of the group
        if (!community.users.includes(userId)) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: "User is not a member of this community",
            });
        }

        // Remove the user from the users array
        community.users = community.users.filter((id) => id.toString() !== userId);
        await community.save();

        return res.status(HttpStatus.OK).json({
            message: "User removed from community successfully",
        });
    } catch (error) {
        console.error("Error removing user from community:", error);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: "Error removing user from community",
        });
    }
}



public async dashboard(req: Request, res: Response): Promise<Response> {
    try {
        const totalUsers = await UserModel.countDocuments();
        const instructors = await UserModel.countDocuments({ role: "instructor" });
        const students = await UserModel.countDocuments({ role: "student" });
        const blockedUsers = await UserModel.countDocuments({ isBlocked: true });

        const dashboard = {
          totalUsers, instructors, students, blockedUsers,
        }
         return res.status(HttpStatus.OK).json({
            message: "dashboard fetched successfully", dashboard
        });

    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
}



 



};




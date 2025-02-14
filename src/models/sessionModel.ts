import mongoose, { Schema, Document, Types } from 'mongoose';


export interface IInstructor {
    _id: string;
    firstName: string;
    lastName: string;
    image: { url: string };
}

export interface ISession extends Document {
    title: string;
    introduction: string;
    duration: string;
    fee: number;
    descriptionTitle: string;
    description: string;
    timeSlots: string[];
    coverImage: {
        key: string | '';
        url: string | '';
      };
    
      instructorId: Types.ObjectId | IInstructor;
    category?: string;
}


const sessionSchema: Schema<ISession> = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    introduction: { 
        type: String, 
        required: true 
    },
    duration: { 
        type: String, 
        required: true 
    },
    fee: { 
        type: Number, 
        required: true 
    },
    descriptionTitle: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    timeSlots: { 
        type: [String], 
        required: true 
    },
    coverImage: {
        type: {
            key: {
                type: String,
                required: true,
            },
            url: {
                type: String,
                required: true,
            },
        },
        required: true, // make the entire img field required
    },
    instructorId: {
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },

    category: {
        type: String,
        enum: [
          "Science",
          "Technology",
        //   "Engineering",
          "Mathematics",
          "History",
          "Languages",
          "Business",
          "Finance",
          "Personal Development",
          "Arts",
        ],
        required: false
      },


},{timestamps:true});



export const SessionModel = mongoose.model<ISession>("Session", sessionSchema);
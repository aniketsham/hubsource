import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: "USER" | "ADMIN";
  avatar?: string;
  bio?: string;
  likes: string[]; // resource IDs
  saves: string[]; // resource IDs
  following: string[]; // user IDs this user follows
  followers: string[]; // user IDs that follow this user
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
    avatar: { type: String },
    bio: { type: String },
    likes: [{ type: String }],
    saves: [{ type: String }],
    following: [{ type: String }],
    followers: [{ type: String }],
  },
  { timestamps: true },
);

const UserModel: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);

export default UserModel;

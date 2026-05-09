import mongoose, { Schema, Document, Model } from "mongoose";

export interface IResource extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  category: string;
  tags: string[];
  postedBy: mongoose.Types.ObjectId;
  postedByName: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  status: "PENDING" | "APPROVED" | "REJECTED";
  isFeatured: boolean;
  likesCount: number;
  savesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    url: { type: String, required: true },
    thumbnail: { type: String },
    category: { type: String, required: true },
    tags: [{ type: String }],
    postedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    postedByName: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"],
      default: "BEGINNER",
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    isFeatured: { type: Boolean, default: false },
    likesCount: { type: Number, default: 0 },
    savesCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

ResourceSchema.index({ status: 1, createdAt: -1 });
ResourceSchema.index({ category: 1, status: 1 });

const ResourceModel: Model<IResource> =
  mongoose.models.Resource ??
  mongoose.model<IResource>("Resource", ResourceSchema);

export default ResourceModel;

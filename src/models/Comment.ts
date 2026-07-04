import mongoose, { Schema, Document, Model } from "mongoose";

export interface IComment extends Document {
  _id: mongoose.Types.ObjectId;
  content: string;
  userId: mongoose.Types.ObjectId;
  userName: string;
  userAvatar?: string;
  resourceId: mongoose.Types.ObjectId;
  parentId?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    content: { type: String, required: true, trim: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    userAvatar: { type: String },
    resourceId: {
      type: Schema.Types.ObjectId,
      ref: "Resource",
      required: true,
    },
    parentId: { type: Schema.Types.ObjectId, ref: "Comment", default: null },
  },
  { timestamps: true },
);

CommentSchema.index({ resourceId: 1, createdAt: -1 });
CommentSchema.index({ parentId: 1, createdAt: 1 });

const CommentModel: Model<IComment> =
  mongoose.models.Comment ?? mongoose.model<IComment>("Comment", CommentSchema);

export default CommentModel;

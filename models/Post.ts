import { Schema, model, Document } from "mongoose";

export interface IPost extends Document {
  user: Schema.Types.ObjectId;
  content: string;
  likes: Schema.Types.ObjectId[];
  comments: {
    user: Schema.Types.ObjectId;
    content: string;
    createdAt?: Date;
  }[];
}

const postSchema = new Schema<IPost>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        content: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

export default model<IPost>("Post", postSchema);

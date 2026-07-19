import { Schema, Types, model, Document } from "mongoose";

export interface ISession extends Document {
  browser: string;
  near?: string;
  ip: string;
  status: boolean;
  user: Schema.Types.ObjectId;
}

const sessionSchema = new Schema<ISession>(
  {
    browser: {
      type: String,
      required: true,
    },
    near: {
      type: String,
      required: true,
    },
    ip: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default model("Session", sessionSchema);

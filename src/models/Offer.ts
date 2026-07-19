import { Schema, model, Document } from "mongoose";

export interface IOffer extends Document {
  user: Schema.Types.ObjectId;
  expire: Number;
  code: String;
}

const OfferSchema = new Schema<IOffer>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    expire: { type: Number, default: 1 },
  },
  {
    timestamps: true,
  },
);

export default model("Offer", OfferSchema);

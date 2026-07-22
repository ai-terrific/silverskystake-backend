import { Schema, Types, model, Document } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName?: string;
  username: string;
  email: string;
  password: string;
  ignoredUsers: { user: Schema.Types.ObjectId; createdAt?: Date }[];
  country: String;
  birthPlace: String;
  birthday: String;
  address: String;
  city: String;
  postalCode: Number;
  industry: String;
  occupation: String;
  experience: String;
  avatar: String;
  identification: {
    front: String;
    back: String;
  };
  proofAddress: string;
  fund: string;
}

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
      unique: true,
    },
    lastName: {
      type: String,
    },
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    ignoredUsers: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        createdAt: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
    country: String,
    birthPlace: String,
    birthday: String,
    address: String,
    city: String,
    postalCode: Number,
    industry: String,
    occupation: String,
    experience: String,
    avatar: String,
    identification: {
      front: String,
      back: String,
    },
    proofAddress: String,
    fund: String,
  },
  {
    timestamps: true,
  },
);

export default model('User', userSchema);

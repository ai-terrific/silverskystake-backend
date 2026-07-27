import { Schema, Types, model, Document, Model } from 'mongoose';

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
  secret: string | Uint8Array<ArrayBufferLike>;
  twoFARequired: Boolean;
}

interface IUserModel extends Model<IUser> {
  findByEmail(email: string): Promise<(IUser & Document) | null>;
}

const userSchema = new Schema<IUser, IUserModel>(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
    },
    username: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      index: true,
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
    secret: String,
    twoFARequired: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.statics.findByEmail = async function (email: string) {
  return this.findOne({ email });
};

userSchema.statics.findByEmailOrUsername = async function (
  emailOrUsername: string,
) {
  return this.findOne({
    $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
  });
};

export default model<IUser, IUserModel>('User', userSchema);

import { HydratedDocument, model, Schema, Types } from "mongoose";

export enum allowCommentsEnum {
  allow = "allow",
  deny = "deny",
}
export enum AvailabilityEnum {
  public = "public",
  friends = "friends",
  onlyMe = "only-me",
}
export interface IPost {
  content?: string;
  attachments?: string[];
  // assetFolderId: string;

  allowComments: allowCommentsEnum;
  availability: AvailabilityEnum;

  tags: Types.ObjectId[];
  likes?: Types.ObjectId[];

  createdBy: Types.ObjectId;

  freezedBy?: Types.ObjectId;
  freezedAt?: Types.ObjectId;

  restoredBy?: Types.ObjectId;
  restoredAt?: Types.ObjectId;

  deletedBy?: Types.ObjectId;
  deletedAt?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    content: { type: String ,minLength: 1,maxlength: 50000,required:function (){
      return this.attachments?.length === 0
    } },

    attachments: { type: [String], default: [] },
    // assetFolderId: { type: String, required: true },

    allowComments: {
      type: String,
      enum: Object.values(allowCommentsEnum),
      default: allowCommentsEnum.allow,
    },
    availability: {
      type: String,
      enum: Object.values(AvailabilityEnum),
      default: AvailabilityEnum.public,
    },

    tags: [{ type: Schema.Types.ObjectId, ref: "User" }],
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],

    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    freezedBy: { type: Schema.Types.ObjectId, ref: "User" },
    freezedAt: { type: Date },

    restoredBy: { type: Schema.Types.ObjectId, ref: "User" },
    restoredAt: { type: Date },

    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
    deletedAt: { type: Date },

},
  {
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

export type HPostDocument = HydratedDocument<IPost>;
export const PostModel=model<IPost>('Post',postSchema);

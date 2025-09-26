import { HydratedDocument, model, Schema, Types } from "mongoose";
import { allowCommentsEnum, AvailabilityEnum } from "./post.model";
export interface IComment {
  content?: string;
  attachments?: string[];
  postId: Types.ObjectId;
  commentId?: Types.ObjectId;

  allowComments: allowCommentsEnum;
  availability: AvailabilityEnum;

  tags: Types.ObjectId[];
  likes?: Types.ObjectId[];

  createdBy: Types.ObjectId;

  freezedBy?: Types.ObjectId;
  freezedAt?: Date;

  restoredBy?: Types.ObjectId;
  restoredAt?: Date;

  deletedBy?: Types.ObjectId;
  deletedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    commentId: { type: Schema.Types.ObjectId, ref: "Comment", required: true },

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

commentSchema.pre(["find", "findOne"], async function (next) {
  const query = this.getQuery();
  if (query.pranoid === false) {
    this.setQuery({ ...query });
  } else {
    this.setQuery({ ...query, freezedAt: { $exists: false } });
  }
  next();
});
commentSchema.pre(["updateOne", "findOneAndUpdate"], async function (next) {
  const query = this.getQuery();
  if (query.pranoid === false) {
    this.setQuery({ ...query });
  } else {
    this.setQuery({ ...query, freezedAt: { $exists: false } });
  }
  next();
});


export type HcommentDocument = HydratedDocument<IComment>;
export const commentModel=model<IComment>('Comment',commentSchema);
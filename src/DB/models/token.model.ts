import { Schema, model, Document, HydratedDocument, Types } from "mongoose";

export interface IToken extends Document {
  userId:Types.ObjectId;
  jti: string;
  expiresAt: Date;
  revoked: boolean;
  createdAt: Date;
}

const TokenSchema = new Schema<IToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    jti: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    revoked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Auto-remove expired tokens
TokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const TokenModel = model<IToken>("Token", TokenSchema);
export default TokenModel;
export type HTokenModel=HydratedDocument<IToken>;

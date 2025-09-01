import { Model } from "mongoose";
import { IToken } from "../models/token.model";
import { DatabaseRepository } from "./database.repository";

export class TokenRepository extends DatabaseRepository<IToken> {
  constructor(protected readonly model: Model<IToken>) {
    super(model);
  }

  async isRevoked(jti: string): Promise<boolean> {
    const token = await this.findOne({
      filter: { jti },
    });

    return !token ? false : token.revoked;
  }

  async revokeAllByUserId(userId: string): Promise<void> {
    await this.model.updateMany({ userId }, { revoked: true });
  }
}

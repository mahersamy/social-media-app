import type { NextFunction, Request, Response } from "express";
import TokenUtil, { tokenTypeEnum } from "../utils/security/token.security";
import {
  BadRequestException,
  UnauthorizedRequestException,
} from "../utils/response/error.response";
import { HUserDocument } from "../DB/models/user.model";
import { UserRole } from "../DB/models/user.interface";
import TokenModel from "../DB/models/token.model";
import { TokenRepository } from "../DB/repository/token.repository";
import UserModel from "../DB/models/user.model";
import { UserRepository } from "../DB/repository/user.repository";

const tokenRepo = new TokenRepository(TokenModel);
const userRepo = new UserRepository(UserModel);

export const authenticationMiddleware = (tokenType: tokenTypeEnum = tokenTypeEnum.Access) =>
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
      throw new BadRequestException("Validation error", {
        issue: {
          key: "headers",
          path: "authorization",
          message: "missing authorization",
        },
      });
    }

    const { decoded, user } = await TokenUtil.decodeToken({
      authorization: req.headers.authorization,
      tokentype: tokenType,
    });

    // ✅ check revoked token (logoutEnum.only)
    if (decoded.jti) {
      const revoked = await tokenRepo.isRevoked(decoded.jti);
      if (revoked) {
        throw new UnauthorizedRequestException("Token revoked");
      }
    }

    // ✅ check credentials changed after token issued (logoutEnum.all)
    if (
      user?.changeCredentioalsTime &&
      decoded.iat &&
      decoded.iat * 1000 < user.changeCredentioalsTime.getTime()
    ) {
      throw new UnauthorizedRequestException("Token invalid due to logout-all");
    }

    req.user = user as HUserDocument;
    req.decode = decoded;
    next();
  };



export const authorizationMiddleware = (accessRole: UserRole[] = []) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
      throw new BadRequestException("Validation error", {
        issue: {
          key: "headers",
          path: "authorization",
          message: "missing authorization",
        },
      });
    }

    if (!accessRole.includes(req.user?.role!)) {
      throw new UnauthorizedRequestException("Not authorized account");
    }
    next();
  };
};

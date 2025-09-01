import { JwtPayload, Secret, sign, SignOptions, verify } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import UserModel, { HUserDocument } from "../../DB/models/user.model";
import { UserRole } from "../../DB/models/user.interface";
import {
  BadRequestException,
  NotFoundRequestException,
  UnauthorizedRequestException,
} from "../response/error.response";
import { UserRepository } from "../../DB/repository/user.repository";

export enum SignatureLevelEnum {
  Bearer = "Bearer",
  System = "System",
}
export enum tokenTypeEnum {
  Access = "access",
  Refresh = "refresh",
}

export enum logoutEnum {
  only = "only",
  all = "all",
}
class TokenUtil {
  private userRepo = new UserRepository(UserModel);
  async generateToken({
    payload,
    secret = process.env.JWT_SECRET_ACCESS as string,
    options = { expiresIn: Number(process.env.JWT_ACCESS_EXP) },
  }: {
    payload: Object;
    secret?: Secret;
    options?: SignOptions;
  }): Promise<string> {
    return sign(payload, secret, options);
  }

  async detectedSignatureLevel(role: UserRole = UserRole.USER) {
    let SignatureLevel: SignatureLevelEnum = SignatureLevelEnum.Bearer;
    switch (role) {
      case UserRole.ADMIN:
        SignatureLevel = SignatureLevelEnum.System;
        break;
      default:
        break;
    }
    return SignatureLevel;
  }

  async getSignatureLevel(
    SignatureLevel: SignatureLevelEnum = SignatureLevelEnum.Bearer
  ) {
    let secretAccessKey = process.env.JWT_SECRET_BEARER_ACCESS;
    let AccessExpiresIn = process.env.JWT_ACCESS_BEARER_EXP;
    let secretRefreshKey = process.env.JWT_SECRET_BEARER_REFRESH;
    let RefreshExpiresIn = process.env.JWT_REFRESH_BEARER_EXP;
    switch (SignatureLevel) {
      case SignatureLevelEnum.System:
        secretAccessKey = process.env.JWT_SECRET_SYSTEM_ACCESS;
        AccessExpiresIn = process.env.JWT_ACCESS_SYSTEM_EXP;
        secretRefreshKey = process.env.JWT_SECRET_SYSTEM_REFRESH;
        RefreshExpiresIn = process.env.JWT_REFRESH_SYSTEM_EXP;
        break;
    }
    return {
      secretAccessKey,
      AccessExpiresIn: Number(AccessExpiresIn),
      secretRefreshKey,
      RefreshExpiresIn: Number(RefreshExpiresIn),
    };
  }

  async createLoginCredentioals(user: HUserDocument) {
    const SignatureLevel = await this.detectedSignatureLevel(user.role);
    const Signatures = await this.getSignatureLevel(SignatureLevel);

    const accessToken = await this.generateToken({
      payload: { _id: user._id.toString(), email: user.email, role: user.role },
      secret: Signatures.secretAccessKey,
      options: {
        jwtid: uuidv4(),
        expiresIn: Signatures.AccessExpiresIn,
      },
    });
    const refreshToken = await this.generateToken({
      payload: { _id: user._id.toString(), email: user.email, role: user.role },
      secret: Signatures.secretRefreshKey,
      options: {
        jwtid: uuidv4(),
        expiresIn:Signatures.RefreshExpiresIn,
      },
    });

    return { accessToken, refreshToken };
  }

  async verifyToken({
    token,
    secret = process.env.JWT_SECRET_ACCESS as string,
  }: {
    token: string;
    secret?: Secret;
  }): Promise<JwtPayload> {
    return verify(token, secret) as JwtPayload;
  }

  async decodeToken({
    authorization,
    tokentype = tokenTypeEnum.Access,
  }: {
    authorization: string;
    tokentype?: tokenTypeEnum;
  }) {
    const [signature, token] = authorization.split(" ");
    if (!signature || !token) {
      throw new UnauthorizedRequestException("Missing Token Part");
    }
    const signatures = await this.getSignatureLevel(
      signature as SignatureLevelEnum
    );
    const decoded = await this.verifyToken({
      token,
      secret:
        tokentype === tokenTypeEnum.Refresh
          ? signatures.secretRefreshKey
          : signatures.secretAccessKey,
    });

    if (!decoded) {
      throw new BadRequestException("Invalid Token");
    }

    const user = await this.userRepo.findUser({
      filter: { _id: decoded._id },
      select: {},
    });

    if (!user) {
      throw new NotFoundRequestException("User Not Found");
    }
    return { user, decoded };
  }
}
export default new TokenUtil();

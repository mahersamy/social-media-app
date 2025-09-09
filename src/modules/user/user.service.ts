import { type NextFunction, type Response, type Request } from "express";
import { ILogoutDto } from "./user.dto";
import { logoutEnum } from "../../utils/security/token.security";
import UserModel, { HUserDocument } from "../../DB/models/user.model";
import { UpdateQuery } from "mongoose";
import { IUser } from "../../DB/models/user.interface";
import { UserRepository } from "../../DB/repository/user.repository";
import { TokenRepository } from "../../DB/repository/token.repository";
import TokenModel from "../../DB/models/token.model";
import TokenUtil from "../../utils/security/token.security"
import { file } from "zod";
class UserService {
  private userRepo = new UserRepository(UserModel);
  private tokenRepo = new TokenRepository(TokenModel);

  profile = async (req: Request, res: Response, next: NextFunction) => {
    return res.json({ message: "success", user: req.user, decode: req.decode });
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    const { flag }: ILogoutDto = req.body;
    const update: UpdateQuery<IUser> = {};

    switch (flag) {
      case logoutEnum.only:
        await this.tokenRepo.create({
          data: [
            {
              userId: req.user!._id,
              jti: req.decode?.jti as string,
              expiresAt: new Date(req.decode!.exp! * 1000),
              revoked: true,
            },
          ],
        });
        break;

      case logoutEnum.all:
        update.changeCredentioalsTime = new Date();
        break;
    }

    if (Object.keys(update).length > 0) {
      await this.userRepo.updateOneUser({
        filter: { _id: req.user!._id },
        update,
      });
    }

    return res.json({ message: "success" });
  };

  refreshToken= async (req: Request, res: Response, next: NextFunction) =>{
    await this.tokenRepo.create({
          data: [
            {
              userId: req.user!._id,
              jti: req.decode?.jti as string,
              expiresAt: new Date(req.decode!.exp! * 1000),
              revoked: true,
            },
          ],
        });
    const {accessToken,refreshToken}= await TokenUtil.createLoginCredentioals(req.user as HUserDocument);
    
    return res.json({ message: "Signin Success", accessToken,refreshToken });

  }

  uploadProfileImage= async (req: Request, res: Response, next: NextFunction) =>{
    

    await this.userRepo.updateOneUser({
      filter: { _id: req.user!._id },
      update: {
        profileImage: req.file?.path
      },
    })

    return res.json({ message: "uploaded success Success",file: req.file });

  }

  uploadCoverImage= async (req: Request, res: Response, next: NextFunction) =>{
    
    let arrOfDestinationPath = [];
    for (const file of req.files as Express.Multer.File[]) {
      arrOfDestinationPath.push(file.path);
    }

    await this.userRepo.updateOneUser({
      filter: { _id: req.user!._id },
      update: {
        coverImages: arrOfDestinationPath as string[]
      },
    })

    return res.json({ message: "uploaded success Success",file: req.files });

  }
}

export default new UserService();



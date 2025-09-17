import { Router } from "express";
import UserService from "./user.service";
import {
  authenticationMiddleware,
  authorizationMiddleware,
} from "../../middleware/authentication.middleware";
import { userRoles } from "./user.authorization";
import { validationMiddelware } from "../../middleware/validation.middleware";
import * as Validation from "./user.validation";
import { tokenTypeEnum } from "../../utils/security/token.security";
import { localUpload } from "../../middleware/multer.middelware";

const router = Router();

router.get(
  "/profile",
  authenticationMiddleware(),
  authorizationMiddleware(userRoles),
  UserService.profile
);
router.delete(
  "/logout",
  authenticationMiddleware(),
  validationMiddelware(Validation.logoutValidation),
  UserService.logout
);
router.post(
  "/refresh",
  authenticationMiddleware(tokenTypeEnum.Refresh),
  UserService.refreshToken
);
router.post(
  "/update-email",
  authenticationMiddleware(),
  UserService.updateEmail
);
router.patch(
  "/confirm-update-email",
  authenticationMiddleware(),
  UserService.confirmUpdateEmail
);
router.patch(
  "/upload-profile-image",
  authenticationMiddleware(),
  localUpload("profile").single("profile"),
  UserService.uploadProfileImage
);
router.patch(
  "/upload-profile-cover",
  authenticationMiddleware(),
  localUpload("cover",3).array("cover"),
  UserService.uploadCoverImage
);
router.patch(
  "/update-basic-profile",
  authenticationMiddleware(),
  validationMiddelware(Validation.updateBasicProfileValidation),
  UserService.updateBasicProfile
);

export default router;

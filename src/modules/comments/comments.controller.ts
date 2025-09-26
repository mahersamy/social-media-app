import { Router } from "express";
import { authenticationMiddleware } from "../../middleware/authentication.middleware";
import { localUpload } from "../../middleware/multer.middelware";
import commentsService from "./comments.service";
import { createCommentValidation } from "./comments.validation";
import { validationMiddelware } from "../../middleware/validation.middleware";
const router = Router();

router.post(
  "/",
  authenticationMiddleware(),
  localUpload("images", 3).array("images"),
  validationMiddelware(createCommentValidation),
  commentsService.createComment
);

export default router;

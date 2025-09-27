import { Router } from "express";
import { authenticationMiddleware } from "../../middleware/authentication.middleware";
import { localUpload } from "../../middleware/multer.middelware";
import commentsService from "./comments.service";
import { createCommentValidation, replayCommentValidation } from "./comments.validation";
import { validationMiddelware } from "../../middleware/validation.middleware";
const router = Router({mergeParams: true});

router.post(
  "/",
  authenticationMiddleware(),
  localUpload("images", 3).array("images"),
  validationMiddelware(createCommentValidation),
  commentsService.createComment
);
router.post(
  "/:commentId/replay",
  authenticationMiddleware(),
  localUpload("images", 3).array("images"),
  validationMiddelware(replayCommentValidation),
  commentsService.replayOnComment
);

export default router;

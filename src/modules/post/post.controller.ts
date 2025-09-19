import { Router } from "express";
import postService from "./post.service";
import { authenticationMiddleware } from "../../middleware/authentication.middleware";
import { localUpload } from "../../middleware/multer.middelware";
import { validationMiddelware } from "../../middleware/validation.middleware";
import { createPostValidation, likePostValidation } from "./post.validation";
const router = Router();

router.post(
  "/",
  authenticationMiddleware(),
  localUpload("attachments", 3).array("attachments"),
  validationMiddelware(createPostValidation),
  postService.createPost
);

router.patch(
  "/:postId/like",
  authenticationMiddleware(),
  validationMiddelware(likePostValidation),
  postService.likePost
);

export default router;

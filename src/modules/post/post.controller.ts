import { Router } from "express";
import postService from "./post.service";
import { authenticationMiddleware } from "../../middleware/authentication.middleware";
import { localUpload } from "../../middleware/multer.middelware";
import { validationMiddelware } from "../../middleware/validation.middleware";
import { createPostValidation, likePostValidation, updatePostValidation } from "./post.validation";
import commentsController from "../../modules/comments/comments.controller"
const router = Router({mergeParams: true});

router.use(
  "/:postId/comments",
  commentsController
);

router.post(
  "/",
  authenticationMiddleware(),
  localUpload("attachments", 3).array("attachments"),
  validationMiddelware(createPostValidation),
  postService.createPost
);
router.get(
  "/",
  authenticationMiddleware(),
  postService.postList
);

router.patch(
  "/:postId/like",
  authenticationMiddleware(),
  validationMiddelware(likePostValidation),
  postService.likePost
);

router.patch(
  "/:postId",
  authenticationMiddleware(),
  localUpload("attachments", 3).array("attachments"),
  validationMiddelware(updatePostValidation),
  postService.updatePost
);

export default router;

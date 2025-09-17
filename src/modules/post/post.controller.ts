import { Router } from "express";
import postService from "./post.service";
import { authenticationMiddleware } from "../../middleware/authentication.middleware";
import { localUpload } from "../../middleware/multer.middelware";
import { validationMiddelware } from "../../middleware/validation.middleware";
import { createPostValidation } from "./post.validation";
const router = Router();

router.post(
  "/",
  authenticationMiddleware(),
  localUpload("attachments", 3).array("attachments"),
  validationMiddelware(createPostValidation),
  postService.createPost
);

export default router;

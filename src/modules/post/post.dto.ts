import z from "zod";
import { createPostValidation, likePostValidation, updatePostValidation } from "./post.validation";



export type createPostDto = z.infer<typeof createPostValidation.body>;
export type updatePostDto = z.infer<typeof updatePostValidation.body>;
export type likePostDto = z.infer<typeof likePostValidation.query>;
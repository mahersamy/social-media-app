import z from "zod";
import { createPostValidation, likePostValidation } from "./post.validation";



export type createPostDto = z.infer<typeof createPostValidation.body>;
export type likePostDto = z.infer<typeof likePostValidation.query>;
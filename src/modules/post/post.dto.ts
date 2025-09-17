import z from "zod";
import { createPostValidation } from "./post.validation";



export type createPostDto = z.infer<typeof createPostValidation.body>;
import z from "zod";
import { createCommentValidation } from "./comments.validation";

export type createCommentDto = z.infer<typeof createCommentValidation.body>;

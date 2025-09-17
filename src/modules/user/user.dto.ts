import * as z from "zod";
import { confirmUpdateEmailValidation, logoutValidation, updateEmailValidation } from "./user.validation";


export type ILogoutDto= z.infer<typeof logoutValidation.body>;
export type IUpdateEmail= z.infer<typeof updateEmailValidation.body>;
export type IConfirmUpdateEmail= z.infer<typeof confirmUpdateEmailValidation.body>;
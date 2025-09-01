import * as z from "zod";
import { logoutValidation } from "./user.validation";


export type ILogoutDto= z.infer<typeof logoutValidation.body>;
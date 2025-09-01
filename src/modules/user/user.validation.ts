import * as z from "zod";
import { logoutEnum } from "../../utils/security/token.security";
export const logoutValidation={
    body:z.strictObject({
        flag:z.enum(logoutEnum)
    })
}
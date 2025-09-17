import * as z from "zod";
import { logoutEnum } from "../../utils/security/token.security";

export const logoutValidation={
    body:z.strictObject({
        flag:z.enum(logoutEnum)
    })
}

export const updateEmailValidation={
    body:z.strictObject({
        newEmail:z.email()
    })
}

export const confirmUpdateEmailValidation={
    body:z.strictObject({
        newEmail:z.email(),
        otp:z.string()
    })
}

export const updateBasicProfileValidation = {
  body: z.object({
    firstName: z.string().min(2).max(25).optional(),
    lastName: z.string().min(2).max(25).optional(),
    username: z.string().min(2).max(51).optional(),
    age: z.number().int().min(0).max(120).optional(),
    phone: z.string().optional(),
    gender: z.enum(["male", "female", "other"]).optional(),
  }).refine((data) => {
      const [firstname, lastname] = data.username?.split(" ") || [];
      return !firstname && !lastname
  },{
    message: "Username should not contain spaces",
    path: ["username"]
  }),
};

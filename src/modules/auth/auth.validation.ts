import * as z from "zod";
export const signupValidation = {
  body: z
    .object({
      firstName: z.string().min(2).max(25),
      lastName: z.string().min(2).max(25),
      email: z.email(),
      password: z
        .string()
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        ),
      confirmPassword: z.string(),
      phone: z.string().regex(/^01[0-2,5]\d{8}$/),
      age: z.number().int().min(1),
      gender: z.enum(["male", "female", "other"]),
      // role is intentionally excluded
    })
    .superRefine((data, ctx) => {
      if (data.confirmPassword !== data.password) {
        ctx.addIssue({
          code: "custom",
          path: ["confirmPassword"],
          message: "Password missMatch confirmPassword",
        });
      }
    }),
};

export const signinValidation = {
  body: z.object({
    email: z.email(),
    password: z
        .string()
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        ),
  }),
};

export const confirmEmailValidation = {
  body: z.object({
    email: z.email(),
    otp:z.string(),
})}

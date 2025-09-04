import { Router } from "express";
import authService from "./auth.service";
import { validationMiddelware } from "../../middleware/validation.middleware";
import * as validators from "./auth.validation";


const router=Router()


router.post("/signup",validationMiddelware(validators.signupValidation),authService.signup)
router.post("/signin",validationMiddelware(validators.signinValidation),authService.signin)
router.post("/confirm-email",validationMiddelware(validators.confirmEmailValidation),authService.confirmEmail)


router.post("/forget-password",validationMiddelware(validators.forgetPasswordValidation),authService.forgetPassword)
router.post("/varify-forget-password",validationMiddelware(validators.confirmEmailValidation),authService.verifyForgetPassword)
router.post("/reset-forget-password",validationMiddelware(validators.resetPasswordValidation),authService.resetForgetPassword)

export default router;
import { Router } from "express";
import authService from "./auth.service";
import { validationMiddelware } from "../../middleware/validation.middleware";
import * as validators from "./auth.validation";


const router=Router()


router.post("/signup",validationMiddelware(validators.signupValidation),authService.signup)
router.post("/signin",validationMiddelware(validators.signinValidation),authService.signin)
router.post("/confirm-email",validationMiddelware(validators.confirmEmailValidation),authService.confirmEmail)

export default router;
import { Router } from "express";
import UserService from "./user.service"
import { authenticationMiddleware, authorizationMiddleware } from "../../middleware/authentication.middleware";
import { userRoles } from "./user.authorization";
import { validationMiddelware } from "../../middleware/validation.middleware";
import * as Validation from "./user.validation";


const router=Router()


router.get("/profile",authenticationMiddleware(),authorizationMiddleware(userRoles),UserService.profile)
router.delete("/logout",authenticationMiddleware(),validationMiddelware(Validation.logoutValidation),UserService.logout)


export default router;
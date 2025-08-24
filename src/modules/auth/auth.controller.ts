import { Router } from "express";
import authService from "./auth.service";


const router=Router()


router.post("/signup",authService.signup)
router.post("/signin",authService.signin)
router.post("/confirm-email",authService.confirmEmail)

export default router;
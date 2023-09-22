import { Router } from "express";
import { Mysignup_post, mylogin_post } from "../controllers/authCortlMysql.js";

import {
    signup_post,
    login_post,
    logout_get,
} from "../controllers/authController.js";

const authRouter = Router();

authRouter.post("/mysignup", Mysignup_post);
authRouter.post("/mylogin", mylogin_post);
authRouter.post("/signup", signup_post);
// router.post("/login", login_post);
authRouter.get("/logout", logout_get);

export default authRouter;

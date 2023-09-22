import { Router } from "express";
import {
    mygetAllUsers,
    mygetUser,
    add_permissions,
    get_permissions,
    removeBranchId,
} from "../modules/users.js";

const userRouter = Router();

userRouter.post("/permissions", add_permissions);
userRouter.post("/getpermissions", get_permissions);
userRouter.post("/myuser", mygetUser);
userRouter.get("/myusers", mygetAllUsers);
userRouter.post("/removeBranchId", removeBranchId);

export default userRouter;

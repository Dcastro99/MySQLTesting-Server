import USERModel from "../models/user.js";
import { loginErrors } from "../errorHandlers/loginErrors.js";
import jwt from "jsonwebtoken";


const maxAge = 3 * 24 * 60 * 60;

const createToken = (id) => {
    return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: maxAge,
    });
};

const signup_post = async (req, res) => {
    console.log("user signing up", req.headers.cookie);
    const { email, password, empNum, branch_id } = req.body;
    try {
        const user = await USERModel.create({
            email,
            password,
            empNum,
            branch_id,
        });
        const token = createToken(user._id);
        res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(201).json({ user: user._id });
    } catch (err) {
        console.log(err);
        const errors = loginErrors(err);
        res.status(400).send({ errors });
    }
};

const login_post = async (req, res) => {
    console.log("user logging in", req.body);
    const { email, password } = req.body;

    try {
        const user = await USERModel.login(email, password);
        const token = createToken(user._id);
        res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(200).send({ user: user._id });
    } catch (err) {
        console.log(err);
        const errors = loginErrors(err);
        res.status(400).send({ errors });
    }
};

const logout_get = async (req, res) => {
    const token = req;

    try {
        res.cookie("jwt", "", { maxAge: 1 });
        res.status(200).send("Logged out successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
};

export { signup_post, login_post, logout_get };

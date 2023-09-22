import { loginErrors } from "../errorHandlers/loginErrors.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { mysqlconnection } from "../../server.js";
import util from "util";
import pkg from "validator";
import { v4 as uuidv4 } from "uuid";

const { isEmail } = pkg;

// const { v4: uuidv4 } = require('uuid');

const maxAge = 3 * 24 * 60 * 60;

const createToken = (id) => {
    return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: maxAge,
    });
};

const Mysignup_post = async (req, res) => {
    // console.log("user signing up", req.body);
    const uniqueId = uuidv4();

    const { email, password, empNum, branch_id } = req.body;
    try {
        if (!isEmail(email)) {
            return res.status(400).send({ email: "Email is not valid" });
        }
        if (password.length < 6) {
            return res
                .status(400)
                .send({ password: "Password must be at least 6 characters" });
        }
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);
        const userData = {
            user_id: uniqueId,
            email,
            password: hashedPassword,
            empNum,
            branch_id,
        };

        // console.log("userData:", userData);

        const userResults = await util
            .promisify(mysqlconnection.query)
            .bind(mysqlconnection)("INSERT INTO users SET ?", userData);

        // console.log("Results ID:", userResults);

        const permissionsData = {
            user_id: uniqueId,
            branch_ids: JSON.stringify([branch_id]),
            role: 3,
        };

// console.log("permissionsData:", permissionsData);

        const permissionResults = await util
            .promisify(mysqlconnection.query)
            .bind(mysqlconnection)(
            "INSERT INTO permissions SET ?",
            permissionsData
        );

        console.log("Permission ID:", permissionResults.insertId);

        await util.promisify(mysqlconnection.query).bind(mysqlconnection)(
            "UPDATE users SET permissions_id = ? WHERE user_id = ?",
            [permissionResults.insertId, uniqueId]
        );

        res.status(201).send(userResults);
    } catch (error) {
        // console.error("Error executing query:", error.code);
        const errors = loginErrors(error);
        // console.log("errors:", errors);
        res.status(500).send(errors);
    }
};

const mylogin_post = async (req, res) => {
    console.log("user logging in", req.body);
    const { email, password } = req.body;

    try {
        if (!isEmail(email)) {
            return res.status(400).send({ email: "Email is not valid" });
        }
        if (password.length < 6) {
            return res
                .status(400)
                .send({ password: "Password must be at least 6 characters" });
        }

        const [user] = await mysqlconnection
            .promise()
            .query("SELECT * FROM users WHERE email = ?", [email]);
        console.log("user Login:", user);

        if (user) {
            const auth = await bcrypt.compare(password, user[0].password);
            console.log("auth:", auth);
            if (auth) {
                const token = createToken(user[0].user_id);
                res.cookie("jwt", token, {
                    httpOnly: true,
                    maxAge: maxAge * 1000,
                });
                res.status(200).send({ user: user[0].user_id });
            } else {
                res.status(400).send({ password: "Incorrect password!!" });
            }
        } else {
            res.status(400).send({ email: "Incorrect email" });
        }
    } catch (err) {        const errors = loginErrors(err);
        res.status(400).send(errors);
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

export { Mysignup_post, mylogin_post, logout_get };

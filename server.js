import dotenv from "dotenv";
import express, { json } from "express";
import cors from "cors";
import mysql from "mysql2";

import pkg from "mongoose";
import cookieParser from "cookie-parser";
import { checkUser } from "./src/middleware/validate.js";
import authRouter from "./src/routes/authRoutes.js";
import userRouter from "./src/routes/userRoutes.js";
import ticketRouter from "./src/routes/ticketRoutes.js";

// ------------ MONG-DB -------------/

dotenv.config();

// -----------APP USING EXPRESS & JSON -------------//
const PORT = process.env.PORT || 3002;
const app = express();
app.use(cors());
app.use(json());
app.use(cookieParser());

const mysqlconnection = mysql.createConnection({
    host: process.env.HOST,
    user: "root",
    password: process.env.PASSWORD,
    database: "TeamMembers",
});

mysqlconnection.connect((err) => {
    if (err) {
        console.error("Error connecting to MySQL:", err);
        return;
    }
    console.log("Connected to MySQL");
});

const { set, connect, connection } = pkg;
set("strictQuery", true);
connect(process.env.DATABASE_URL);
const db = connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Mongoose is connected");
});

// ------------ ROUTES -------------//
app.get("*", checkUser);
// app.post("/user", requireAuth, getUser);
// app.get("/users", getAllUsers);

app.use(userRouter);
app.use(authRouter);
app.use(ticketRouter);

app.get("/", (request, response) => {
    response.send("TESTING login tutorial APP!");
});

app.listen(PORT, () => console.log(`listening on ${PORT}`));

export { mysqlconnection };

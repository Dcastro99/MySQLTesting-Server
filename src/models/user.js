import mongoose from "mongoose";
import pkg from "validator";
import bcrypt from "bcrypt";
//testing

const { isEmail } = pkg;
const { Schema } = mongoose;

const user = new Schema({
    email: {
        type: String,
        unique: true,
        required: [true, "Please enter an email"],
        lowercase: true,
        validate: [isEmail, "Please enter a valid email"],
    },
    password: {
        type: String,
        required: [true, "Please enter a password"],
        minlength: [6, "Minimum passsword length is 6 characters"],
    },
    empNum: Number,
    branch_id: Number,
});

user.pre("save", async function (next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

user.statics.login = async function (email, password) {
    const user = await this.findOne({ email });
    if (user) {
        const auth = await bcrypt.compare(password, user.password);
        if (auth) {
            return user;
        }
        throw Error("incorrect password");
    }
    throw Error("incorrect email");
};

const USERModel = mongoose.model("user", user);

export default USERModel;

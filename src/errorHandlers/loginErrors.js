const loginErrors = (err) => {
    console.log("in LoginErrors message::", err.message, "CODE!!", err.code);

    let errors = { email: "", password: "" };

    // incorrect email
    if (
        err.message === "incorrect email" ||
        err.message === "Incorrect email"
    ) {
        errors.email = "that email is not registered";
    }

    // incorrect password
    if (
        err.message === "incorrect password" ||
        err.message === "Incorrect password"
    ) {
        errors.password = "that password is incorrect";
    }

    if (
        err.message ===
        `Cannot read properties of undefined (reading 'password')`
    ) {
        errors.password = "email or password is incorrect";
    }

    // duplicate error code
    if (err.code === 11000) {
        errors.email = "that email is already registered";
        return errors;
    }
    if (err.code === "ER_DUP_ENTRY") {
        errors.email = "that email is already registered";
        // console.log("errors", errors);
        return errors;
    }

    if (err.message.includes("myuser validation failed")) {
        const error = Object.values(err.errors);
        console.log("error", error);
    }

    return errors;
};

export { loginErrors };

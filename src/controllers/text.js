const Mysignup_post = async (req, res) => {
    console.log("user signing up", req.body);
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

        console.log("userData:", userData);

        try {
            const results = await util
                .promisify(mysqlconnection.query)
                .bind(mysqlconnection)("INSERT INTO users SET ?", userData);

            console.log("Results ID:", results);
            
            const permissionsData = {
                user_id: uniqueId,
                branch_ids: JSON.stringify([branch_id]), 
                role: 3,
            };
            
            await util
                .promisify(mysqlconnection.query)
                .bind(mysqlconnection)("INSERT INTO permissions SET ?", permissionsData);

            res.status(201).send(results);
        } catch (error) {
            console.error("Error executing query:", error.code);
            const errors = loginErrors(error);
            console.log("errors:", errors);
            res.status(500).send(errors);
        }
    } catch (err) {
        console.log("err>>>", err);
        res.status(400).send(err);
    }
};

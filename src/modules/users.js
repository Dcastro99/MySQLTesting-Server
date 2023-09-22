import USERModel from "../models/user.js";
import { mysqlconnection } from "../../server.js";

//-------------------GET ALL USERS-------------------//

async function getAllUsers(req, res, next) {
    const myUser = res.locals.user;
    console.log("myUser", myUser.branch_id);
    try {
        const users = await USERModel.find({ branch_id: myUser.branch_id });

        res.status(200).send(users);
    } catch (err) {
        next(err);
    }
}

//-------------------GET ALL USERS-------------------//

const mygetAllUsers = async (req, res, next) => {
    const myUser = res.locals.user;
    console.log("myUser- getAll", myUser);

    try {
        const [users] = await mysqlconnection
            .promise()
            .query("SELECT * FROM users WHERE branch_id = ?", [
                myUser.branch_id,
            ]);

        console.log("users", users);
        res.status(200).send(users);
    } catch (err) {
        next(err);
    }
};

//-------------------GET ONE USER-------------------//

async function getUser(req, res, next) {
    console.log("req.body in getUser()", req.body);
    const id = req.body._id;

    try {
        const user = await USERModel.findById(id);
        const userObj = {
            email: user.email,
            empNum: user.empNum,
            branch_id: user.branch_id,
            _id: user._id,
        };
        console.log("user getUser", userObj);
        res.status(200).send(userObj);
    } catch (err) {
        next(err);
    }
}

//-------------------GET ONE USER-------------------//

const mygetUser = async (req, res, next) => {
    console.log("req.body", req.body);
    const id = req.body._id;

    try {
        const [user] = await mysqlconnection
            .promise()
            .query("SELECT * FROM users WHERE user_id = ?", [id]);
        console.log("myuser- getOne", user);

        if (user.length > 0) {
            const userObj = {
                email: user[0].email,
                empNum: user[0].empNum,
                branch_id: user[0].branch_id,
                user_id: user[0].user_id,
            };
            console.log("user", userObj);
            res.status(200).send(userObj);
        } else {
            res.status(404).send("User not found");
        }
    } catch (err) {
        next(err);
    }
};

//-------------------ADD PERMISSIONS FUNCTION-------------------//

const addBranchIdsAndRole = async (userId, newBranchIds, role) => {
    try {
        const [row] = await mysqlconnection
            .promise()
            .query(
                "SELECT branch_ids, role FROM permissions WHERE user_id = ?",
                [userId]
            );
        const currentBranchIds = (row[0].branch_ids || [])
            .map((id) => parseInt(id))
            .filter((id) => !isNaN(id));
        const newBranchId = parseInt(newBranchIds);

        let updatedRole = role;

        if (isNaN(newBranchId)) {
            console.error(`Invalid branch ID ${newBranchIds}`);
            return;
        }

        if (role === "") {
            updatedRole = row[0].role;
        }

        const updatedBranchIds = [
            ...new Set([...currentBranchIds, newBranchId]),
        ];
        console.log("updatedBranchIds", updatedBranchIds);
        await mysqlconnection
            .promise()
            .query(
                "UPDATE permissions SET branch_ids = ?, role = ? WHERE user_id = ?",
                [JSON.stringify(updatedBranchIds), updatedRole, userId]
            );

        console.log(`Added new branch IDs and role for user ${userId}`);
    } catch (err) {
        console.error(err);
    }
};

//-------------------ADD PERMISSIONS-------------------//

const add_permissions = async (req, res) => {
    console.log("user adding permissions", req.body);

    const { email, branch_ids, role } = req.body;

    try {
        const [user] = await mysqlconnection
            .promise()
            .query("SELECT * FROM users WHERE email = ?", [email]);
        console.log("myuser- getOne", user[0].user_id);

        if (user[0].user_id) {
            await addBranchIdsAndRole(user[0].user_id, branch_ids, role);
            res.status(200).send("Permissions added successfully");
        } else {
            res.status(404).send("User not found");
        }
    } catch (err) {
        console.error(err);
    }
};

//-------------------GET PERMISSIONS-------------------//

const get_permissions = async (req, res) => {
    console.log("user getting permissions", req.body);

    const { email } = req.body;
    try {
        const [user] = await mysqlconnection
            .promise()
            .query(
                "SELECT u.user_id,u.email, p.role, p.branch_ids FROM users u JOIN permissions p ON u.permissions_id = p.id WHERE u.email = ?",
                [email]
            );
        console.log("user", user[0]);
        if (user[0] === undefined) {
            console.log("User not found");
            res.status(404).send("User not found");
        } else {
            res.status(200).send(user[0]);
        }

        console.log("User with Permissions:", user[0]);
    } catch (err) {
        console.error(err);
    }
};


//-------------------REMOVE BRANCH ID FUNCTION-------------------//

const removeUserIdBranchId = async (userId, branchId) => {
    console.log("userId", userId);
    console.log("branchId", branchId);
    try {
        const [row] = await mysqlconnection
            .promise()
            .query(
                "SELECT branch_ids FROM permissions WHERE user_id = ?",
                [userId]
            );
            console.log("row", row);

        const currentBranchIds = row[0].branch_ids || "[]";
        console.log("currentBranchIds", currentBranchIds);

        const updatedBranchIds = currentBranchIds.filter(id => id !== branchId);

        await mysqlconnection
            .promise()
            .query(
                "UPDATE permissions SET branch_ids = ? WHERE user_id = ?",
                [JSON.stringify(updatedBranchIds), userId]
            );

        console.log(`Removed branch ID ${branchId} for user ${userId}`);
    } catch (err) {
        console.error(err);
    }
};


//-------------------REMOVE BRANCH ID-------------------//

const removeBranchId = async (req, res) => {
    console.log("branchId being removed", req.body);

    const { email, branch_ids } = req.body;

    try {
        const [user] = await mysqlconnection
            .promise()
            .query("SELECT * FROM users WHERE email = ?", [email]);
        console.log("myuser- getOne", user[0].user_id);

        if (user[0].user_id) {
            await removeUserIdBranchId(user[0].user_id, branch_ids);
            res.status(200).send("Permissions added successfully");
        } else {
            res.status(404).send("User not found");
        }
    } catch (err) {
        console.error(err);
    }
};




export {
    getAllUsers,
    getUser,
    mygetAllUsers,
    mygetUser,
    add_permissions,
    get_permissions,
    removeBranchId
};

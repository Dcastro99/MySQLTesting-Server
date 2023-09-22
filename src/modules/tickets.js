import { mysqlconnection } from "../../server.js";
import util from "util";

const createTicket = async (req, res) => {
    console.log("user creating ticket", req.body);

    const {
        customerName,
        orderNumber,
        customerPO,
        timeStamp,
        storeData,
        branch_id,
    } = req.body;

    try {
        const ticketData = {
            customerName,
            orderNumber,
            customerPO,
            timeStamp,
            storeData,
            branch_id,
        };

        const ticketResults = await util
            .promisify(mysqlconnection.query)
            .bind(mysqlconnection)("INSERT INTO tickets SET ?", ticketData);

        console.log("ticketResults ID:", ticketResults);
        res.status(201).send(ticketResults);
    } catch (e) {
        console.log("err>>>", e);
    }
};
export { createTicket };

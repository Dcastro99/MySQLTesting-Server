import { Router } from "express";

import { createTicket } from "../modules/tickets.js";

const ticketRouter = Router();

ticketRouter.post("/createTicket", createTicket);

export default ticketRouter;

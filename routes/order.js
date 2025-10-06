import express from "express";
import { createTransaction, createOrder, 
    getOrdersByUserId  } from "../controllers/order.js";

const router = express.Router();

router.post('/transaction', createTransaction);
router.get('/:userId', getOrdersByUserId);
router.post('/create', createOrder);

export default router;



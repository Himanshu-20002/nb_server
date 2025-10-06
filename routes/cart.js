import express from "express";
import { addToCart, getCart, updateCartItem } from "../controllers/cart.js";

const router = express.Router();

router.post('/add', addToCart);
router.get('/:userId', getCart);
router.put('/update', updateCartItem);

export default router;
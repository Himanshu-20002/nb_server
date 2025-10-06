import express from "express";
import { getProductsByCategoryId } from "../controllers/product.js";

const router = express.Router();

router.get('/:categoryId', getProductsByCategoryId);
//api call will be like this: http://localhost:3000/product/66b60a0a6b60a0a0a0a0a0a0

 
export default router;


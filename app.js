import express from "express";
import dotenv from "dotenv";
import userRouter from "./routes/user.js";
import categoryRouter from "./routes/category.js";
import productRouter from "./routes/product.js";
import orderRouter from "./routes/order.js";
import connectDB from "./config/connecct.js";
import { PORT } from "./config/config.js";
import { buildAdminJSExpressRouter } from "./config/setup.js";
import cors from "cors";
import cartRouter from "./routes/cart.js";
dotenv.config();

const app = express();
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? [
            'exp://*', // Allow Expo client
            'http://192.168.29.142:19000', // Your local Expo server
            'http://192.168.29.142:19006', // Your local web debug
            'http://192.168.29.142:3000'  , // Your local development
            'http://192.168.29.*:*' // Allow any port on your local network

          ]
        : '*',
    credentials: true
}));

//routes
app.use('/user', userRouter)
app.use('/category', categoryRouter)
app.use('/product', productRouter)
app.use('/order', orderRouter)
app.use('/cart', cartRouter);
const start = async () => {
    try {
        await connectDB();
        await buildAdminJSExpressRouter(app);
        app.listen(PORT, '0.0.0.0', (err) => {
            if (err) {
                console.log(err);
            }
            console.log(`Server is running on http://192.168.29.142:${PORT}/admin`);
        });
    } catch (error) {
        console.log("Error starting server", error);
    }
};

start();
export default app;
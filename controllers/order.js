import Razorpay from "razorpay";
import Order from "../models/order.js";
import crypto from "crypto";
import Transaction from "../models/transaction.js";

const createTransaction = async (req, res) => {
    try {
        const { amount, userId } = req.body;

        if (!amount || !userId) {
            return res.status(400).json({
                success: false,
                message: "Amount and userId are required"
            });
        }
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
        const options = {
            amount: amount,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
            notes: {
                userId: userId
            }
        }
        const order = await razorpay.orders.create(options);

        res.status(200).json({
            success: true,
            message: "Order created successfully",
            key: process.env.RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency,
            order_id: order.id,
        });

    } catch (error) {
        console.error('Transaction creation error:', error);
        res.status(500).json({
            success: false,
            message: "Error creating transaction",
            error: error.message
        });
    }
};
const createOrder = async (req, res) => {
    try {
        const {
            userId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            deliveryDate,
            address,
        } = req.body;

        // Get cart items instead of receiving them in request
        const cart = await Cart.findOne({ user: userId }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty"
            });
        }

        // Convert cart items to order items format
        const cartItems = cart.items.map(item => {
            const product = item.product;
            let price = product.price;
            
            // Handle combo products
            if (product.isComboProduct && item.comboOption !== undefined) {
                price = product.comboOptions[item.comboOption].price;
            }

            return {
                product: product._id,
                name: product.name,
                image_uri: product.images[0],
                price: price,
                quantity: item.quantity,
                comboOption: item.comboOption,
                comboDetails: item.comboOption !== undefined ? {
                    name: product.comboOptions[item.comboOption].name,
                    price: product.comboOptions[item.comboOption].price
                } : null
            };
        });

        // Signature verification
        const key_secret = process.env.RAZORPAY_KEY_SECRET;
        const generatedSignature = crypto
            .createHmac("sha256", key_secret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (generatedSignature === razorpay_signature) {
            const totalAmount = cartItems.reduce((acc, item) =>
                acc + (Number(item.price) * Number(item.quantity)), 0);

            // Create transaction
            const transaction = await Transaction.create({
                user: userId,
                order_Id: razorpay_order_id,
                payment_Id: razorpay_payment_id,
                amount: totalAmount,
                payment_method: "upi",
                payment_status: "confirmed",
                payment_date: new Date(),
                payment_time: new Date(),
            });

            // Create order
            const order = await Order.create({
                user: userId,
                items: cartItems,
                total_price: totalAmount,
                status: "Order Placed",
                delivery_address: address,
                delivery_date: deliveryDate,
            });

            // Link transaction to order
            transaction.order = order._id;
            await transaction.save();

            // Clear the cart after successful order
            cart.items = [];
            cart.total = 0;
            await cart.save();

            return res.status(200).json({
                success: true,
                message: "Payment verified and order created successfully",
                order
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed"
            });
        }

    } catch (error) {
        console.error('Order Creation Error:', error);
        return res.status(500).json({
            success: false,
            message: "Error creating order",
            error: error.message
        });
    }
};

const getOrdersByUserId = async (req, res) => {
    const { userId } = req.params;
    try {
        const orders = await Order.find({ user: userId })
            .populate("user", "name email")
            .populate("items.product", "name price image_uri")
            .sort({ createdAt: -1 })
        if (!orders || orders.length === 0) {
            return res.status(404).json({ success: false, message: "No orders found" });
        }
        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error getting orders", error: error.message });
    }
}

export { createTransaction, createOrder, getOrdersByUserId };
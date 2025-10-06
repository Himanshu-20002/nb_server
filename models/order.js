import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema({
    product: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Product",
        required: true 
    },
    name: { type: String, required: true },
    image_uri: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    comboOption: { type: Number }, // Add this for combo products
    comboDetails: {
        name: String,
        price: Number
    }
});

const OrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    delivery_address: { type: String, required: true },
    delivery_date: { type: Date, required: false },
    items: { type: [ItemSchema], required: true },
    total_price: { type: Number, required: true },
    status: {
        type: String,
        enum: ["Order Placed", "Confirmed", "Shipped", "Delivered", "Cancelled"],
        default: "Order Placed",
        required: true
    },
    payment_status: {
        type: String,
        enum: ["Pending", "Completed", "Failed"],
        default: "Pending"
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
const Order = mongoose.model("Order", OrderSchema);

export default Order;



import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    amount: { type: Number, required: true},
    payment_Id: { type: String, required: true},
    order_Id: { type: String, required: true},
    payment_method: { type: String, enum: ["cash", "upi"], required: true},
    payment_status: { type: String, enum: ["pending", "confirmed", "failed"], default: "pending", required: true},
    payment_date: { type: Date, required: true},
    payment_time: { type: Date, required: true},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const Transaction = mongoose.model("Transaction", TransactionSchema);

export default Transaction;

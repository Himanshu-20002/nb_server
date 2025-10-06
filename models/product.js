import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  images: [{
    type: String,
    required: true
  }],
  price: { type: Number, required: true },
  description: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  isComboProduct: { type: Boolean, default: false },
  isUnder99: { type: Boolean, default: false },
  comboOptions: [{
    name: { type: String },
    products: [{
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, default: 1 }
    }],
    price: { type: Number }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const Product = mongoose.model("Product", productSchema);

export default Product;

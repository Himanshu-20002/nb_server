import Cart from "../models/cart.js";
import Product from "../models/product.js";

export const addToCart = async (req, res) => {
    try {
        const { userId, productId, quantity, comboOption } = req.body;
        
        let cart = await Cart.findOne({ user: userId });
        
        // Create new cart if doesn't exist
        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        // Check if product already exists in cart
        const existingItemIndex = cart.items.findIndex(
            item => item.product.toString() === productId &&
                   item.comboOption === comboOption
        );

        if (existingItemIndex > -1) {
            // Update quantity if item exists
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            // Add new item
            cart.items.push({
                product: productId,
                quantity,
                comboOption
            });
        }

        // Calculate total
        await cart.populate('items.product');
        cart.total = cart.items.reduce((sum, item) => {
            const price = item.comboOption !== undefined ? 
                item.product.comboOptions[item.comboOption].price : 
                item.product.price;
            return sum + (price * item.quantity);
        }, 0);

        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error adding to cart" });
    }
};

export const getCart = async (req, res) => {
    try {
        const { userId } = req.params;
        const cart = await Cart.findOne({ user: userId })
            .populate('items.product');
        
        if (!cart) {
            return res.json({ items: [], total: 0 });
        }

        res.status(200).json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching cart" });
    }
};

export const updateCartItem = async (req, res) => {
    try {
        const { userId, itemId, quantity } = req.body;
        
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        const item = cart.items.id(itemId);
        if (!item) {
            return res.status(404).json({ message: "Item not found in cart" });
        }

        if (quantity <= 0) {
            cart.items.pull(itemId);
        } else {
            item.quantity = quantity;
        }

        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating cart" });
    }
};
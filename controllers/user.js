import User from "../models/user.js";
import jwt from "jsonwebtoken";

const generateToken = (user) => {
    const accessToken = jwt.sign({ userId: user?._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "2d" });
    const refreshToken = jwt.sign({ userId: user?._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
    return { accessToken, refreshToken };
}

const loginOrSignup = async (req, res) => {
    try {
        const { phone, address } = req.body;
        let user = await User.findOne({ phone });

        if (!user) {
            user = await User.create({ phone, address });
            await user.save();
            return res.status(200).json({ message: "User created successfully" });
        } else {
            user.address = address;
            await user.save();
            const { accessToken, refreshToken } = generateToken(user.toObject());
            return res.status(200).json({
                message: "User updated successfully",
                user,
                accessToken,
                refreshToken // sending this to front end and saving it in cookies
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export { loginOrSignup };


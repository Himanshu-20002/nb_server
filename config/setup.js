import AdminJS from "adminjs";
import AdminJSExpress from "@adminjs/express";
import session from "express-session";
import ConnectMongoDBSession from "connect-mongodb-session";
import Product from "../models/product.js";
import Category from "../models/category.js";
import User from "../models/user.js";
import Order from "../models/order.js";
import Transaction from "../models/transaction.js";
import { COOKIE_PASSWORD } from "./config.js";
import * as AdminJSMongoose from "@adminjs/mongoose";
import { dark, light, noSidebar } from "@adminjs/themes"
import Cart from "../models/cart.js";

AdminJS.registerAdapter(AdminJSMongoose);

// Move admin credentials to environment variables
const DEFAULT_ADMIN = {
    email: process.env.ADMIN_EMAIL || "admin@kcart.com",
    password: process.env.ADMIN_PASSWORD || "admin",
};

const authenticate = async (email, password) => {
    if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
        return Promise.resolve(DEFAULT_ADMIN);
    }
    return null;
};

export const buildAdminJSExpressRouter = async (app) => {
    const admin = new AdminJS({
        resources: [
            {
                resource: User,
                options: {
                    properties: {
                        password: { isVisible: false }, // Hide sensitive fields
                    },
                },
            },
            { resource: Product },
            { resource: Category },
            { resource: Order },
            { resource: Transaction },
            { resource: Cart },
        ],
        branding: {
            companyName: "kcart",
            withMadeWithLove: false,
            favicon: "https://seeklogo.com/images/B/blinkit-logo-568D32C8EC-seeklogo.com.png",
            logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjyjf6vesMmJy_yDwxmL76J2uwHUqBGSvZVA&s"
        },
        defaultTheme: dark.id,
        availableThemes: [dark, light, noSidebar],
        rootPath: "/admin",
        dashboard: {
            handler: async () => {
                return {
                    message: 'Welcome to KCart Admin',
                }
            }
        },
    });

    // Configure session store
    const MongoDBStore = ConnectMongoDBSession(session);
    const sessionStore = new MongoDBStore({
        uri: process.env.MONGO_URI,
        collection: "admin_sessions",
        expires: 1000 * 60 * 60 * 24 * 7, // 7 days
        connectionOptions: {},
    });

    // Handle session store errors
    sessionStore.on('error', (error) => {
        console.error('Session Store Error:', error);
    });

    const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
        admin,
        {
            authenticate,
            cookiePassword: COOKIE_PASSWORD,
            cookieName: "adminjs",
        },
        null,
        {
            store: sessionStore,
            resave: false,
            saveUninitialized: false,
            secret: COOKIE_PASSWORD,
            cookie: {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax',
                maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
            },
            name: "adminjs",
        }
    );

    // Add error handling middleware
    adminRouter.use((err, req, res, next) => {
        console.error('AdminJS Error:', err);
        next(err);
    });

    app.use(admin.options.rootPath, adminRouter);
};
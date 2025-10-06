import mongoose from "mongoose"
import "dotenv/config.js";
import Product from "./models/product.js"
import Category from "./models/category.js"
import {categoriesData, productData} from "./seedData.js"

async function seedData() {
    try {
        await mongoose.connect(process.env.MONGO_URI)

        // Delete existing data
        await Category.deleteMany({});
        await Product.deleteMany({});

        const categoryDoc = await Category.insertMany(categoriesData);
        const categoryMap = categoryDoc.reduce((map, category) => {
            map[category.name] = category._id;
            return map;
        }, {});



        console.log("Category Map:", categoryMap);


        const productWithCategoryIds = productData.map((product) => {
            return {
                ...product,
                category: categoryMap[product.category]
            }
        });

        await Product.insertMany(productWithCategoryIds);
        console.log("Data seeded successfully");

    } catch (error) {
        console.log("Error seeding data", error);
    } finally {
        mongoose.connection.close();
    }
}

seedData();
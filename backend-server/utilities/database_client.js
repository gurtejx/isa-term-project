import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

/**
 * Database client class to connect to MongoDB.
 * Follows singleton design pattern.
 */
export class DatabaseClient {
    constructor() {
        if (!DatabaseClient.instance) {
            this.connect();
            DatabaseClient.instance = this;
        }
        return DatabaseClient.instance;
    }

    async connect() {
        try {
            const uri = process.env.MONGODB_URI || `mongodb://127.0.0.1:27017/`;
            await mongoose.connect(uri, {
                dbName: "isa_term_proj",
            });
            console.log("MongoDB connected successfully");
        } catch (error) {
            console.error("Error connecting to MongoDB:", error);
        }
    }
}

export default DatabaseClient;
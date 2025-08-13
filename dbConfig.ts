// dbConfig.ts - establish a connection to a MongoDB database
import mongoose from 'mongoose';

export async function connect() {
    try {
        if (!process.env.MONGO_DB_URL) {
            throw new Error("MONGO_DB_URL is not defined. Check your environment variables.");
        }

        await mongoose.connect(process.env.MONGO_DB_URL, {
        } as mongoose.ConnectOptions);

        const connection = mongoose.connection;

        connection.on('connected', () => {
            console.log("MongoDB connected successfully");
        });

        connection.on('error', (err) => {
            console.error("MongoDB connection error:", err);
            process.exit(1);
        });
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
}

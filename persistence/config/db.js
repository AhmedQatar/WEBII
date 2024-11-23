const mongoose = require('mongoose');
const MONGO_URI = 'mongodb+srv://Ahmed:12class34@cluster0.rmkaojn.mongodb.net/language_exchange';

let isConnected = false;

/**
 * Connect to MongoDB and return the database instance.
 * @returns {Promise<mongoose.Connection>} Mongoose connection instance
 */
async function connectToDb() {
    if (!isConnected) {
        try {
            const connection = await mongoose.connect(MONGO_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            isConnected = true;
            console.log('Connected to MongoDB database: language-exchange');
            return mongoose.connection.db; // Return the native MongoDB connection
        } catch (error) {
            console.error('Error connecting to MongoDB:', error.message);
            throw new Error('Failed to connect to the database');
        }
    }
    return mongoose.connection.db;
}

module.exports = connectToDb;






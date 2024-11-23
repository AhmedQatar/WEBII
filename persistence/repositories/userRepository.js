const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const connectToDb = require('../config/db'); // Import database connection

// Ensure the database is connected
connectToDb();

async function getDb() {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection.db; // Return the native MongoDB connection
    }
    throw new Error('Database not connected');
}


const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePhoto: {type: String ,default: ''},
    fluentLanguages: [String],
    learningLanguages: [String],
    contacts: [String],
    blockedUsers: [String ],
    badges: [String],
    emailVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    lastLogin: { type: Date, default: null },

});

// Pre-save hook for password hashing
// userSchema.pre('save', async function (next) {
//     if (!this.isModified('password')) return next();
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
// });

// Verify password
userSchema.methods.verifyPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Create User model
const User = mongoose.model('User', userSchema);

// Repository Functions

/**
 * Create a new user
 */
async function createUser(userData) {
    const user = new User(userData);
    return await user.save();
}

/**
 * Find a user by email
 */
async function findUserByEmail(email) {
    return await User.findOne({ email });
}

/**
 * Find a user by ID
 */
async function findUserById(userId) {
    return await User.findById(userId)
}

/**
 * Add a contact to a user
 */
async function addContact(userId, contactId) {
    const user = await User.findById(userId);
    if (user.contacts.includes(contactId)) {
        throw new Error('Contact already exists.');
    }
    user.contacts.push(contactId);
    return await user.save();
}

/**
 * Remove a contact from a user
 */
async function removeContact(userId, contactId) {
    const user = await User.findById(userId);
    user.contacts = user.contacts.filter((id) => id.toString() !== contactId);
    return await user.save();
}

/**
 * Block a user
 */
async function blockUser(userId, blockedUserId) {
    const user = await User.findById(userId);
    if (user.blockedUsers.includes(blockedUserId)) {
        throw new Error('User already blocked.');
    }
    user.blockedUsers.push(blockedUserId);
    return await user.save();
}

/**
 * Unblock a user
 */
async function unblockUser(userId, blockedUserId) {
    const user = await User.findById(userId);
    user.blockedUsers = user.blockedUsers.filter((id) => id.toString() !== blockedUserId);
    return await user.save();
}

/**
 * Update the user profile in the database.
 * @param {string} userId - The ID of the user.
 * @param {object} updates - The fields to update.
 * @returns {Promise<object>} - The updated user document.
 */
async function updateUserProfile(userId, updates) {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updates,
            { new: true } // Return the updated document
        );

        return updatedUser;
    } catch (error) {
        console.error('Error updating user profile in the database:', error.message);
        throw error;
    }
}
/**
 * Check if a user is blocked
 */
async function isUserBlocked(userId, blockedUserId) {
    const user = await User.findById(userId);
    return user.blockedUsers.includes(blockedUserId);
}
async function findUserByEmailOrId(identifier) {
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
        // If identifier is an ObjectId
        return User.findById(identifier);
    }
    return User.findOne({ email: identifier });
}

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    addContact,
    removeContact,
    blockUser,
    unblockUser,
    updateUserProfile,
    isUserBlocked,
    getDb,
    findUserByEmailOrId
};





// const { ObjectId } = require('mongodb');
// const connectToDatabase = require('../config/db');


// // function createUserRepository(db) {
// //     if (!db) {
// //         throw new Error('Database connection is required');
// //     }

// //     return {
// //         async createUser(user) {
// //             return db.collection('user').insertOne(user);
// //         },

// //         async findUserByEmail(email) {
// //             return db.collection('user').findOne({ email });
// //         },

// //         async findUserById(userId) {
// //             return db.collection('user').findOne({ _id: new ObjectId(userId) });
// //         },
// //     };
// // }

// const MONGO_URI = 'mongodb+srv://Ahmed:12class34@cluster0.rmkaojn.mongodb.net/';

// let db

// let client;

// // Connect to MongoDB
// connectToDatabase(MONGO_URI)
//     .then((database) => {
//         db = database;
//         console.log('Connected to MongoDB');
//     })
//     .catch((error) => console.error('Failed to connect to MongoDB:', error));






// const { MongoClient } = require('mongodb');

// // Connect to MongoDB and cache the connection
// async function getDb() {
//     if (!db) {
//         connectToDatabase(MONGO_URI)
//             .then((database) => {
//                 db = database;
//                 console.log('Connected to MongoDB');
//             })
//             .catch((error) => console.error('Failed to connect to MongoDB:', error));

//     }
//     return { db }; // Expose both the database and client
// }

// async function createUser(user) {
//     return db.collection('user').insertOne(user);
// }

// async function findUserByEmail(email) {
//     return db.collection('user').findOne({email});
// }

// async function findUserById(userId) {
//     // Validate userId
//     if (!ObjectId.isValid(userId)) {
//         throw new Error('Invalid ObjectId format');
//     }

//     return db.collection('user').findOne({ _id: new ObjectId(userId) });
// }

// module.exports = { getDb, createUser, findUserByEmail, findUserById };


// // async function createUser(user) {
// //     // console.log('DB object:', global.db || app.locals.db); // Log the db object
// //     // const db = global.db || req.app.locals.db; // Use the globally available db or app.locals.db
// //     if (!db) {
// //         throw new Error('Database connection not initialized');
// //     }
// //     return db.collection('user').insertOne(user); // Use the correct collection
// // }

// // async function findUserByEmail(email,) {
// //     // const db =  global.db|| app.locals.db; // Same approach as above
// //     // console.log(db)
// //     if (!db) {
// //         throw new Error('Database connection not initialized');
// //     }    return db.collection('user').findOne({ email });
// // }

// // async function findUserById(userId) {
// //     // const db = global.db || app.locals.db; // Same approach as above
// //     if (!db) {
// //         throw new Error('Database connection not initialized');
// //     }    return db.collection('user').findOne({ _id: new ObjectId(userId) });
// // }

// // module.exports = {createUser, findUserByEmail, findUserById} ;

// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     profilePhoto: String,
//     fluentLanguages: [String],
//     learningLanguages: [String],
//     contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
//     blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
//     badges: [String],
//     emailVerified: { type: Boolean, default: false },
// });

// module.exports = mongoose.model('User', userSchema);


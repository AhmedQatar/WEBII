const { ObjectId } = require('mongodb');


function createUserRepository(db) {
    if (!db) {
        throw new Error('Database connection is required');
    }

    return {
        async createUser(user) {
            return db.collection('user').insertOne(user);
        },

        async findUserByEmail(email) {
            return db.collection('user').findOne({ email });
        },

        async findUserById(userId) {
            return db.collection('user').findOne({ _id: new ObjectId(userId) });
        },
    };
}


// async function createUser(user) {
//     console.log('DB object:', global.db || app.locals.db); // Log the db object
//     const db = global.db || req.app.locals.db; // Use the globally available db or app.locals.db
//     if (!db) {
//         throw new Error('Database connection not initialized');
//     }
//     return db.collection('user').insertOne(user); // Use the correct collection
// }

// async function findUserByEmail(email) {
//     const db = global.db || app.locals.db; // Same approach as above
//     if (!db) {
//         throw new Error('Database connection not initialized');
//     }    return db.collection('user').findOne({ email });
// }

// async function findUserById(userId) {
//     const db = global.db || app.locals.db; // Same approach as above
//     if (!db) {
//         throw new Error('Database connection not initialized');
//     }    return db.collection('user').findOne({ _id: new ObjectId(userId) });
// }

module.exports = createUserRepository ;

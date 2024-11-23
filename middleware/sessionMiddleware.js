//presistence/repositories/sessionStore

// const session = require('express-session');
// const { getDb } = require('./userRepository');

// class MongoSessionStore extends session.Store {
//     constructor(db) {
//         super();
//         this.db = db;
//     }

//     async get(sid, callback) {
//         try {
//             console.log(`Fetching session for SID: ${sid}`); // Debug log
//             const session = await this.db.collection('sessions').findOne({ _id: sid });
//             callback(null, session ? session.sessionData : null);
//         } catch (error) {
//             console.error(`Error fetching session for SID ${sid}:`, error.message);
//             callback(error);
//         }
//     }

//     async set(sid, sessionData, callback) {
//         try {
//             console.log(`Storing session for SID: ${sid}`); // Debug log
//             const expiry = sessionData.cookie.expires
//                 ? new Date(sessionData.cookie.expires)
//                 : new Date(Date.now() + 1000 * 60 * 30); // Default: 30 minutes

//             await this.db.collection('sessions').updateOne(
//                 { _id: sid },
//                 { $set: { sessionData, expires: expiry } },
//                 { upsert: true }
//             );

//             callback(null);
//         } catch (error) {
//             console.error(`Error storing session for SID ${sid}:`, error.message);
//             callback(error);
//         }
//     }

//     async destroy(sid, callback) {
//         try {
//             console.log(`Destroying session for SID: ${sid}`); // Debug log
//             await this.db.collection('sessions').deleteOne({ _id: sid });
//             callback(null);
//         } catch (error) {
//             console.error(`Error destroying session for SID ${sid}:`, error.message);
//             callback(error);
//         }
//     }
// }

// /**
//  * Create a custom session store using MongoDB.
//  */
// async function createSessionStore() {
//     const { db } = await getDb(); // Reuse the existing database connection
//     return new MongoSessionStore(db);
// }

// module.exports = createSessionStore;

const { v4: uuidv4 } = require('uuid');
const connectToDb = require('../persistence/config/db'); // Adjust path to your `db.js`


/**
 * Middleware for managing sessions with MongoDB.
 */

// Flag to track TTL index initialization
let isTTLInitialized = false;
let db

async function sessionMiddleware(req, res, next) {
    console.log('Executing sessionMiddleware...'); // Debug log for middleware execution

    try {
        // Ensure database connection is established and cached
        if (!db) {
            db = await connectToDb(); // Use the reusable connection
            console.log('Database connection established'); // Confirm DB connection

        }

        // Initialize TTL index for sessions only once
        if (!isTTLInitialized) {
            await db.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
            console.log('TTL index created for session expiration');
            isTTLInitialized = true; // Mark TTL index as initialized
        }

        // Retrieve session ID from cookies or generate a new one
        const sessionId = req.cookies.sessionId || uuidv4();


        // Fetch the session from MongoDB or create a new one if it doesn't exist
        let session = await db.collection('sessions').findOne({ _id: sessionId });
        if (!session) {
            const expiry = new Date(Date.now() + 1000 * 60 * 30); // Default: 30 minutes
            session = { _id: sessionId, expiresAt: expiry };
            await db.collection('sessions').insertOne(session);
        }

        // // Attach session data to the request object
         req.session = session.data || {};
        console.log('Session data attached:', req.session); // Debug session data

        // If the session includes userId, fetch and attach user details
        if (req.session.userId) {
            const user = await db.collection('users').findOne({ _id: req.session.userId });
            if (user) {
                req.session.userName = user.email; // User email
                req.session.roles = user.roles || []; // Example: user roles
            }
        }

        // Save session changes back to MongoDB
        req.saveSession = async function () {
            const expiry = new Date(Date.now() + 1000 * 60 * 30); // Refresh expiration
            await db.collection('sessions').updateOne(
                { _id: sessionId },
                { $set: { data: req.session, expiresAt: expiry } }
            );
        };

        // Set session ID cookie if not already set
        if (!req.cookies.sessionId) {
            res.cookie('sessionId', sessionId, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
                sameSite: 'strict',
                maxAge: 1000 * 60 * 30, // 30 minutes
            });
        }
// Attach `sessionDestroy` to delete session and clear the cookie
req.sessionDestroy = async function (callback) {
    console.log('Attaching sessionDestroy...'); // Debug for sessionDestroy

    try {
        // Delete the session from the database
        const deleteResult = await db.collection('sessions').deleteOne({ _id: sessionId });
        console.log(`Session ${sessionId} destroyed successfully`);

        if (deleteResult.deletedCount > 0) {
            console.log(`Session ${sessionId} destroyed successfully`);
        } else {
            console.warn(`No session found for ID: ${sessionId}`);
        }

        // Clear the session cookie
        res.clearCookie('sessionId', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });

        // Invoke the callback with no error
        if (callback) callback(null);
    } catch (error) {
        console.error('Error destroying session:', error.message);
        // Invoke the callback with the error
        if (callback) callback(error);
    }
};

        next();
    } catch (error) {
        console.error('Session middleware error:', error.message);
        res.status(500).send('Internal Server Error');
    }

}

module.exports = sessionMiddleware;



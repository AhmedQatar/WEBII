const express = require('express');
const csrf = require('csurf');
const cookieParser = require('cookie-parser'); // Needed to read/write cookies
const { MongoClient, ObjectId } = require('mongodb'); // MongoDB client
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const { engine } = require('express-handlebars');
const path = require('path');
const connectToDatabase = require('./config/db'); // Import the database connection function


const app = express();
const PORT = 8000;
const MONGO_URI = 'mongodb+srv://Ahmed:12class34@cluster0.rmkaojn.mongodb.net/';
let db;

// Set up Handlebars as the view engine
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

app.set('views', path.join(__dirname, 'views'));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

/// Connect to MongoDB using the function from db.js
connectToDatabase(MONGO_URI)
.then(database => {
    db = database;
    app.locals.db = db;
    console.log('Connected to MongoDB');
})
.catch(error => console.error('Failed to connect to MongoDB:', error));


// Middleware for cookies
app.use(cookieParser());

// Custom Session Middleware
app.use(async (req, res, next) => {
    const sessionId = req.cookies.session_id || new ObjectId().toString();

    // Attempt to retrieve the session from MongoDB
    let sessionData = await db.collection('sessions').findOne({ _id: sessionId });

    // If session not found, initialize a new session
    if (!sessionData) {
        sessionData = { _id: sessionId, data: {}, expiresAt: new Date(Date.now() + 5 * 60 * 1000) };
        await db.collection('sessions').insertOne(sessionData);
    } else if (sessionData.expiresAt < new Date()) {
        // If session is expired, remove it and create a new one
        await db.collection('sessions').deleteOne({ _id: sessionId });
        sessionData = { _id: sessionId, data: {}, expiresAt: new Date(Date.now() + 5 * 60 * 1000) };
        await db.collection('sessions').insertOne(sessionData);
    }

    // Attach session data to the request object
    req.session = sessionData.data;

    // Save updated session data to MongoDB when the response finishes
    res.on('finish', async () => {
        await db.collection('sessions').updateOne(
            { _id: sessionId },
            { $set: { data: req.session, expiresAt: new Date(Date.now() + 5 * 60 * 1000) } }
        );
    });

    // Set the session cookie if it's new
    if (!req.cookies.session_id) {
        res.cookie('session_id', sessionId, { maxAge: 5 * 60 * 1000, httpOnly: true });
    }

    next();
});

// Middleware to parse form data and CSRF protection
app.use(express.urlencoded({ extended: false }));
app.use(csrf());

// View engine setup (Handlebars)
app.set('view engine', 'handlebars');
app.set('views', './views');

// Define routes
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);

// Root route
app.get('/', (req, res) => {
    res.render('index', { title: 'Home' });
});

// Add CSRF error-handling middleware after routes
app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        // Respond with a 403 Forbidden status and an error message
        res.status(403).send('Invalid CSRF token');
    } else {
        next(err); // Pass other errors to the default error handler
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

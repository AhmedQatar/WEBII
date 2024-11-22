const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const csrf = require('./middleware/csrfProtection');
const connectToDatabase = require('./persistence/config/db');
require('dotenv').config();

const authRoutes = require('./presentation/routes/auth');
const profileRoutes = require('./presentation/routes/profile');

const { engine } = require('express-handlebars');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;
const MONGO_URI = 'mongodb+srv://Ahmed:12class34@cluster0.rmkaojn.mongodb.net/';
let db;

// Set up Handlebars as the view engine
app.engine('handlebars', engine({
    defaultLayout: 'layout', // Default layout file
    layoutsDir: path.join(__dirname, 'views', 'layouts'), // Layouts directory
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(morgan('combined'));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(csrf);

// Serve static files
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1d', etag: false }));

// Connect to MongoDB
connectToDatabase(MONGO_URI)
    .then((database) => {
        db = database;
        app.locals.db = db;
        console.log('Connected to MongoDB');
    })
    .catch((error) => console.error('Failed to connect to MongoDB:', error));

// Routes
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);

// Root route
app.get('/', (req, res) => {
    res.render('index', { title: 'Home' });
});

// CSRF error handling
app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        res.status(403).render('error', { message: 'Invalid CSRF token' });
    } else {
        next(err);
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

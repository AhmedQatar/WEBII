const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const csrf = require('./middleware/csrfProtection');
const crypto = require('crypto');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const userRepository = require('./persistence/repositories/userRepository'); // Import userRepository
require('dotenv').config();
const bodyParser = require('body-parser');
const messageRoutes = require('./presentation/routes/messageRoutes');
const sessionMiddleware = require('./middleware/sessionMiddleware');




const authRoutes = require('./presentation/routes/auth');
const profileRoutes = require('./presentation/routes/profile');

const { engine } = require('express-handlebars');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

// Set up Handlebars as the view engine
app.engine('handlebars', engine({
    defaultLayout: 'layout', // Default layout file
    layoutsDir: path.join(__dirname, 'views', 'layouts'), // Layouts directory
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1d', etag: false }));




// Middleware
app.use(morgan('combined'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(csrf);
app.use(express.json());
app.use(sessionMiddleware);





// Routes
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/messages', messageRoutes);

// Root route
app.get('/', (req, res) => {
    res.render('index', { title: 'Home' });
});

app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        res.status(403).render('error', { message: 'Invalid CSRF token' });
    } else {
        console.error('Unhandled Error:', err.stack || err.message);
        res.status(500).render('error', { message: 'Something went wrong. Please try again later.' });
    }
});



// Set locals for session data
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isAuthenticated || false;
    res.locals.userName = req.session.userName || 'Guest';
    next();
});
app.use((req, res, next) => {
    console.log('Session:', req.session);
    next();
});
app.use((req, res, next) => {
    const token = req.csrfToken();
    console.log('Generated CSRF Token:', token);
    res.locals.csrfToken = token;
    next();
});



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});



// // Middleware for logging session initialization
// app.use((req, res, next) => {
//     console.log('Session before setting properties:', req.session);
//     next();
// });


// // Asynchronous setup for session store
// (async () => {
//     const sessionSecret = crypto.randomBytes(32).toString('hex');
//     console.log('Using Session Secret:', sessionSecret); // Log secret for debugging (remove in production)

//     try {
//         const store = await createSessionStore();
//         console.log('Session store initialized:', !!store);


//         // Apply session middleware before other middleware and routes
//         app.use(
//             session({
//                 store,
//                 secret: sessionSecret,
//                 resave: false,
//                 saveUninitialized: false,
//                 cookie: {
//                     httpOnly: true,
//                     secure: process.env.NODE_ENV === 'production', // Secure cookies in production
//                     sameSite: 'strict',
//                     maxAge: 1000 * 60 * 30, // 30 minutes
//                 },
//             })
//         );

//         console.log('Custom session store initialized');

//         // Start the server only after session middleware is ready
//       
//     } catch (error) {
//         console.error('Failed to initialize session store:', error);
//         process.exit(1); // Exit if session store initialization fails
//     }
// })();

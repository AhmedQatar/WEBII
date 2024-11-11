const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

router.get('/register', (req, res) => {
  res.render('register', { csrfToken: req.csrfToken() });
});

router.post('/register', async (req, res) => {
  const db = req.app.locals.db;
  const { email, password } = req.body;

  try {
    const existingUser = await db.collection('user').findOne({ email });
    if (existingUser) {
      // Redirect back with an error message if the user already exists
      return res.status(400).render('register', {
        errorMessage: 'User already exists',
        csrfToken: req.csrfToken()
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    await db.collection('user').insertOne({ email, password: hashedPassword });

    res.redirect('/auth/login'); // Redirect to login after successful registration
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

router.get('/login', (req, res) => {
  res.render('login', { csrfToken: req.csrfToken() });
});

router.post('/login', async (req, res) => {
  const db = req.app.locals.db;
  const { email, password } = req.body;

  try {
    // Find the user in the database
    const user = await db.collection('user').findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      // Redirect back with an error message if authentication fails
      return res.status(400).render('login', {
        errorMessage: 'Invalid email or password',
        csrfToken: req.csrfToken()
      });
    }

    // Store user ID in session data on successful login
    req.session.userId = user._id;
    req.session.isAuthenticated = true;

    res.redirect('/profile'); // Redirect to a protected page after login
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

router.get('/logout', async (req, res) => {
  const sessionId = req.cookies.session_id;

  // Destroy session in MongoDB
  await req.app.locals.db.collection('sessions').deleteOne({ _id: sessionId });

  // Clear session cookie
  res.clearCookie('session_id');
  res.redirect('/auth/login'); // Redirect to login after logging out
});

module.exports = router;

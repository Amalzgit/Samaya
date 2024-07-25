// Example usage in your Express app
const express = require('express');
const connectDB = require('./config/databaseConfig');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const isAuthenticated = require('./middleware/isAuthenticated');
const config = require('./config/Sessionconfig')
// const nocacheMiddleware = require('./middleware/noCacheMiddleware');

const app = express();

// Database connection
connectDB();

// Middleware setup for sessions
app.use(session({
    secret:config.sessionSecret,
    resave: false,
    saveUninitialized: true
}));

// Use the isAuthenticated middleware
app.use(isAuthenticated);

// View engine setup
app.set('view engine', 'ejs');

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));

// Routes
const userRoute = require('./routes/userRoutes/userRoute');
const auth_route = require('./routes/authRoutes/authRoutes');
const adminRoute = require('./routes/adminRoutes/adminRoute');

app.use('/', userRoute);     
app.use('/', auth_route);
app.use('/admin', adminRoute);

// Server setup
const host = 'localhost';
const port = process.env.PORT || 3000;
app.listen(port, host, () => {
    console.log(`Server is running at http://${host}:${port}`);
});

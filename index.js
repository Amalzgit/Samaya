// Example usage in your Express app
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const nocacheMiddleware = require('./middleware/noCacheMiddleware');
// Load environment variables from .env file


// Database connection
const mongoose = require ('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/Samaya_User');

const app = express();

// View engine setup
app.set('view engine', 'ejs');


// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use( nocacheMiddleware);

// Routes
const userRoute = require('./routes/userRoutes/userRoute');
const auth_route = require('./routes/authRoutes/authRoutes');
const adminRoute = require('./routes/adminRoutes/adminRoute');

app.use('/', userRoute);     
app.use('/', auth_route)
app.use('/admin', adminRoute);


// Error handling middleware


// Server setup
const host = 'localhost';
const port = process.env.PORT || 3000;
app.listen(port, host, () => {
    console.log(`Server is running at http://${host}:${port}`);
});
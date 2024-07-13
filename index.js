// Example usage in your Express app
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
// const loggerMiddleware = require('./middleware/loggerMiddleware');
// const nocacheMiddleware = require('./middleware/noCacheMiddleware');
// const errorHandlerMiddleware = require('./middleware/errorHAndlingMiddleware');

// Load environment variables from .env file


// Database connection
const mongoose = require ('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/Samaya_User');

const app = express();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', './views/users');

// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '/public'));
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name);
    }
});
const upload = multer({ storage: storage });

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
// app.use(loggerMiddleware);
// app.use(['/login', '/admin', '/register', '/'], nocacheMiddleware);

// Routes
const loginRouter = require('./routes/loginRoute');
const userRoute = require('./routes/userRoute');
const adminRoute = require('./routes/adminRoute');

app.use('/', loginRouter);   // Common login route
app.use('/', userRoute);     // User-specific routes
app.use('/admin', adminRoute);  // Admin-specific routes

// Error handling middleware
// app.use(errorHandlerMiddleware);

// Server setup
const host = 'localhost';
const port = process.env.PORT || 3000;
app.listen(port, host, () => {
    console.log(`Server is running at http://${host}:${port}`);
});
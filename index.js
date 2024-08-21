
const express = require('express');
const connectDB = require('./config/databaseConfig');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const isAuthenticated = require('./middleware/isAuthenticated');
const config = require('./config/Sessionconfig');
const app = express();
const Swal = require ('sweetalert2');
const passport =require('passport')
const flash =require('connect-flash')
// Database connection
connectDB();

// sessions
app.use(session({
    secret:config.sessionSecret,
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// loadUser

//  isAuthenticated middleware
app.use(flash());

app.use(isAuthenticated);
// View engine setup
app.set('view engine', 'ejs');

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));

// Routes Paths
const userRoute = require('./routes/userRoutes/userRoute');
const auth_route = require('./routes/authRoutes/authRoutes');
const adminRoute = require('./routes/adminRoutes/adminRoute');
const isblocked = require('./middleware/isblocked');
const loggerMiddleware = require('./middleware/loggerMiddleware');
const loadUser = require('./middleware/loadUser');

app.use(loadUser)


// Global Middlewares
app.use(loggerMiddleware)
app.use(isblocked)

// Blocked Routes

app.get('/blocked',(req,res)=>{
res.render('blocked')
})
// Routes
app.use('/', userRoute);     
app.use('/', auth_route);
app.use('/admin', adminRoute);

// Server setup
const host = 'localhost';
const port = process.env.PORT || 3000;
app.listen(port, host, () => {
    console.log(`Server is running at http://${host}:${port}`);
});

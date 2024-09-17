const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");
// const cron = require("node-cron");

// Import custom modules
const connectDB = require("./config/databaseConfig");
const config = require("./config/Sessionconfig");
const isAuthenticated = require("./middleware/isAuthenticated");
const isblocked = require("./middleware/isblocked");
const loggerMiddleware = require("./middleware/loggerMiddleware");
const loadUser = require("./middleware/loadUser");
// const { updateOfferStatuses } = require("./utils/offertime");

// Routes
const userRoute = require("./routes/userRoutes/userRoute");
const authRoute = require("./routes/authRoutes/authRoutes");
const adminRoute = require("./routes/adminRoutes/adminRoute");

// Initialize Express app
const app = express();

// Connect to database
connectDB();

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "uploads")));

// Session management
app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true,
  })
);

// Initialize Passport and flash
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Custom middlewares
app.use(loadUser);
app.use(loggerMiddleware);
app.use(isblocked);
app.use(isAuthenticated);

// View engine setup
app.set("view engine", "ejs");

// Blocked Routes
app.get("/blocked", (req, res) => {
    res.render("blocked");
  });

// Routes
app.use("/", userRoute);
app.use("/", authRoute);
app.use("/admin", adminRoute);



// Cron jobs
// cron.schedule('* * * * * *', (now) => {
//   if (now.getSeconds() === 0) {
//     updateOfferStatuses();
//   }
// });

// Server setup
const host = "localhost";
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running at http://${host}:${port}`);
});

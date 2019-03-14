require("dotenv").config();

var express        = require("express"),
    app            = express(),
    bodyParser     = require("body-parser"),
    mongoose       = require("mongoose"),
    moment         = require("moment"),
    passport       = require("passport"),
    // cookieParser   = require("cookie-parser"),
    LocalStrategy  = require("passport-local"),
    flash          = require("connect-flash"),
    Food           = require("./models/food"),
    Comment        = require("./models/comment"),
    User           = require("./models/user"),
    session        = require("express-session"),
    seedDB         = require("./seeds"),
    methodOverride = require("method-override");

// requiring routes
var commentRoutes    = require("./routes/comments"),
    foodRoutes       = require("./routes/foods"),
    indexRoutes      = require("./routes/index"),
    userRoutes       = require("./routes/users"),
    passwordRoutes    = require("./routes/password")
    

var url = process.env.DATABASEURL || ("mongodb://localhost:27017/yummy_food", {useNewUrlParser: true});
// process.env.DATABASEURL || 
// mongoose.connect("mongodb://localhost:27017/yummy_food", {useNewUrlParser: true});
mongoose.connect(url);

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride('_method'));
app.locals.moment = moment; // create local variable available for the application
// app.use(cookieParser('secret'));

// seedDB(); //seed the database

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.use("/", indexRoutes);
app.use("/foods", foodRoutes);
app.use("/foods/:id/comments", commentRoutes);
app.use("/users", userRoutes);
app.use("/password", passwordRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
  console.log("The YummyFood Server Has Started!");
});
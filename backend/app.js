const express = require('express');
require('dotenv').config();
const expressLayouts = require('express-ejs-layouts');
const app = express();
const methodOverride = require('method-override');
const port =  process.env.PORT || 4000;
const connectDb = require('./server/config/db');
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo');


app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.Mongodb_Url}),
    cookie: { maxAge: 3600000 }
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

app.use(passport.initialize());
 app.use(passport.session());

//static file
app.use(express.static('public'));

//set template engine
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('layout', './layouts/main');


//routes
app.use('/', require('./server/routes/auth'))
app.use('/', require('./server/routes/index'))
app.use('/', require('./server/routes/dashboard'))
connectDb();

//error handling
app.use((req, res, next) => {
    res.status(404).render('404');
});
//server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
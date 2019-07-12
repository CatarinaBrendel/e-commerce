const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const errorController = require('./controllers/error');
const User = require('./models/user');

const MONGODB_URI = 'mongodb+srv://catarina:daztav-soCkek-nupfi3@cluster0-6anqz.mongodb.net/shop';

const app = express();

const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions' 
});

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'my secret', 
    resave: false, 
    saveUninitialized: false,
    store: store
})); //for production: better a long string value

app.use((request, response, next) => {
    if (!request.session.user) {
        return next();
    }
    User.findById(request.session.user._id)
        .then(user => {
            request.user = user;
            next();
        })
        .catch(error => console.error(error));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
    .connect(MONGODB_URI)
    .then(result => {
        app.listen(3000);
        console.log("Application started on localhost:3000");
    })
    .catch(error => console.error(error));


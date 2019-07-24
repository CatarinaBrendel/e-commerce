const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');


const errorController = require('./controllers/error');
const User = require('./models/user');
const mongoDBUri = require('./config/config');

const app = express();

const store = new MongoDBStore({
    uri: mongoDBUri.mongoUri,
    collection: 'sessions' 
});

const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
    destination: (request, file, callback) => {
        callback(null, 'images');
    },
    filename: (request, file, callback) => {
        callback(null, new Date().toISOString() + '-' + file.originalname)
    }
});

const fileFilter = (request, file, callback) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        callback(null, true);
    } else {
        callback(null, false);
    }
};

app.use(flash());

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({extended: false}));
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(session({
    secret: 'my secret', 
    resave: false, 
    saveUninitialized: false,
    store: store
})); //for production: better a long string value

app.use(csrfProtection);
app.use(flash());

app.use((request, response, next) => {
    response.locals.isAuthenticated = request.session.isLoggedIn;
    response.locals.csrfToken = request.csrfToken();
    next();
});

app.use((request, response, next) => {
    if (!request.session.user) {
        return next();
    }
    User.findById(request.session.user._id)
        .then(user => {
            if(!user) {
                return next();
            }
            request.user = user;
            next();
        })
        .catch(error => {
            next(new Error(error));
        });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500);
app.use(errorController.get404);

app.use((error, request, response, next) => {
    response.status(500).render('500', {
        pageTitle: 'Error!',
        path: '/500',
        isAuthenticated: request.session.isLoggedIn
    });
});


mongoose
    .connect(mongoDBUri.mongoUri)
    .then(result => {
        app.listen(3000);
        console.log("Application started on localhost:3000");
    })
    .catch(error => console.error(error));


const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use((request, response, next) => {
    User.findById('5d25e4d3b6c9e6678c44d77d')
      .then(user => {
        request.user = user;
        next();
      })
      .catch(error => console.error(error)); 
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose
    .connect('mongodb+srv://catarina:daztav-soCkek-nupfi3@cluster0-6anqz.mongodb.net/shop')
    .then(result => {
        User.findOne()
            .then( user => {
                if(!user) {
                    const user = new User({
                        name: 'Catarina',
                        email: 'catarina@email.com',
                        cart: {
                            items: []
                        }
                    });
                    user.save();
                }
            })
            app.listen(3000);
            console.log("Application started on localhost:3000");
        })
    .catch(error => console.error(error));


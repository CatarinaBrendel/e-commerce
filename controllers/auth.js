const bcrypt = require('bcryptjs');

const User = require('../models/user');

exports.getLogin = (request, response, next) => {
  response.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: false
  });
};

exports.postLogin = (request, response, next) => {
  const email = request.body.email;
  const password = request.body.password;

  User.findOne({email: email})
    .then(user => {
      if(!user) {
        return response.redirect('/login');
      }
      bcrypt.compare(password, user.password)
        .then(doMatch => {
          if(doMatch) {
            request.session.isLoggedIn = true;
            request.session.user = user;
            return request.session.save((error) => {
              console.error(error);
              response.redirect('/');
            });
          }
          response.redirect('/login');
        })
        .catch(error => {
          console.error(error);
          response.redirect('/login');
        })
    })
    .catch(error => console.error(error));
};

exports.getSignup = (request, response, next) => {
  response.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: false
  })
};

exports.postSignup = (request, response, next) => {
  const email = request.body.email;
  const password = request.body.password;
  const confirmPassword = request.body.confirmPassword;
  
  User.findOne({email: email})
    .then(userDoc => {
      if(userDoc) {
        return response.redirect('/signup');
      } 
      return bcrypt.hash(password, 12)
        .then(hashedPassword => {
          const user = new User({
            email: email,
            password: hashedPassword,
            cart: { items: [] }
          });
          return user.save();
        })
        .catch(error => console.error(error));;
    })
    .then(result => {
      console.log('User Created successfully!');
      response.redirect('/login');
    })
    .catch(error => console.error(error));
};

exports.postLogout = (request, response, next) => {
  request.session.destroy(error => {
    console.error(error);
    response.redirect('/');
  });
};
const bcrypt = require('bcryptjs');
const sgMail = require('@sendgrid/mail');
const crypto = require('crypto');
const {validationResult} = require('express-validator');

const User = require('../models/user');
const sendGrid = require('../config/config');

sgMail.setApiKey(sendGrid.sendGrid);

exports.getLogin = (request, response, next) => {
  let message = request.flash('error');
  if(message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  response.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message,
    oldInput: {
      email: '',
      password: ''
    },
    validationErrors: ''
  });
};

exports.postLogin = (request, response, next) => {
  const email = request.body.email;
  const password = request.body.password;

  const errors = validationResult(request);
  if(!errors.isEmpty()){
    return response.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        passsword: password
      },
      validationErrors: errors.array()
    });
  }

  User.findOne({email: email})
    .then(user => {
      if(!user) {
        return response.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          errorMessage: 'Invalid email or password',
          oldInput: {
            email: email,
            passsword: password
          },
          validationErrors: []
        });
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
          return response.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: 'Invalid email or password',
            oldInput: {
              email: email,
              passsword: password
            },
            validationErrors: []
          });
        })
        .catch(error => {
          console.error(error);
          response.redirect('/login');
        })
    })
    .catch(error => console.error(error));
};

exports.getSignup = (request, response, next) => {
  let message = request.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  response.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message,
    oldInput: {
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationErrors: ''
  })
};

exports.postSignup = (request, response, next) => {
  const email = request.body.email;
  const password = request.body.password;
  const confirmPassword = request.body.confirmPassword;
  const errors = validationResult(request);

  if(!errors.isEmpty()) {
    return response.status(422).render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: errors.array()[0].msg,
        oldInput: {
          email: email,
          password: password,
          confirmPassword: confirmPassword
        },
        validationErrors: errors.array()  
      }
    );
  }
  bcrypt.hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: { items: [] }
      });
      return user.save();
    })
    .then(result => {
      console.log('User Created successfully!');
      response.redirect('/login');
      const msg = {
        to: email,
        from: 'ecommerce@test.com',
        subject: 'Welcome!',
        text: 'Welcome to our Shop.',
        html: '<h1>You have successfully signed up!</h1>'
      };
    return sgMail.send(msg);
    })
    .catch(error => console.error(error));
};

exports.postLogout = (request, response, next) => {
  request.session.destroy(error => {
    console.error(error);
    response.redirect('/');
  });
};

exports.getReset = (request, response, next) => {
  let message = request.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  response.render('auth/reset', {
      path: '/reset',
      pageTitle: 'Reset Password',
      errorMessage: message
  })
};

exports.postReset = (request, response, next) => {
  crypto.randomBytes(32, (error, buffer) => {
    if(error) {
      return response.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({email: request.body.email})
      .then(user => {
        if(!user) {
          request.flash('error', 'No Accout with this email registered')
          return response.redirect('/reset');
        }

        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then(result => {
        response.redirect('/login');
        const msg = {
          to: request.body.email,
          from: 'ecommerce@test.com',
          subject: 'Password Reset!',
          html: `
            <p>You have requested for a password reset</p>
            <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set your new password.</p>
            <p>If you haven't request any password reset, ignore this message.</p>`
        };
        return sgMail.send(msg);
      })
      .catch(error => console.log(error))
  })
};

exports.getNewPassword = (request, response, next) => {
  const token = request.params.token;
  User.findOne({
    resetToken: token, 
    resetTokenExpiration: {$gt: Date.now()}
  })
    .then(user => {
      let message = request.flash('error');
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      response.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        errorMessage: message,
        userId: user.id,
        passwordToken: token
      })
    })
    .catch(error => console.log(error));
};

exports.postNewPassword = (request, response, next) => {
  const newPassword = request.body.password;
  const userId = request.body.userId;
  const passswordToken = request.body.passwordToken;
  let resetUser;

  User.findOne({
    resetToken: passswordToken, 
    resetTokenExpiration: {$gt: Date.now()},
    _id: userId
  })
    .then(user => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(result => {
      response.redirect('/login');
    })
    .catch(error => console.error(error));
};
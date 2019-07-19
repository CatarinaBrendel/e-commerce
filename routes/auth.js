const express = require('express');
const {check, body} = require('express-validator');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.post('/login', 
[
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email adress')
        .normalizeEmail(),
    body('password')
        .isLength({min: 6})
        .withMessage('The password should contain at least 6 characters')
        .trim()
],
authController.postLogin);

router.get('/signup', authController.getSignup);

router.post('/signup', 
[
    check('email')
        .isEmail()
        .withMessage('Pleasee enter a valid email')
        .custom((value, {req}) => {
            return User.findOne({ email: value })
            .then(userDoc => {
                if (userDoc) {
                    return Promise.reject('Email already registered, please register a different adress')
                }})
            })
            .normalizeEmail(),
    check('password')
        .isLength({min: 6})
        .withMessage('Please enter a password with at least 6 characters')
        .trim(),
    body('confirmPassword')
        .custom((value, {req}) => {
            if(value !== req.body.password) {
                throw new Error('Password confirmation does not match password');
            }
            return true;
        })
        .trim()
], authController.postSignup);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;
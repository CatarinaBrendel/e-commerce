const dotenv = require('dotenv').config();

module.exports = {
    mongoUri: process.env.MONGODB_URI,
    sendGrid: process.env.SENDGRID_API_KEY 
}
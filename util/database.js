const Sequelize = require('sequelize');

const sequelize = new Sequelize('nodejs-complete', 'root', 'Cullen2009Vamp', {
    dialect: 'mysql',
    host: 'localhost'
});

module.exports = sequelize;
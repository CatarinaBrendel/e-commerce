const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'nodejs-complete',
    password: 'Cullen2009Vamp'
});

module.exports = pool.promise();
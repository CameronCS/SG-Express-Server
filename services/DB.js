const mysql = require('mysql2');
require('dotenv').config(); // Make sure to install dotenv

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Using pool to connect and handle queries
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('---------------------------------------------------------------------------------------------------------------');
    console.log('|                                                                                                             |');
    console.log('|                                        Connected to MySQL database                                          |');
    console.log('|                                                                                                             |');
    console.log('---------------------------------------------------------------------------------------------------------------');
    
    // Release the connection back to the pool after you're done
    connection.release();
});

module.exports = pool;

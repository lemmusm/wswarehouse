const mysql = require('mysql2');

// create connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  timezone: '-00:00',
});

// open mysql connection
connection.connect((err) => {
  err
    ? console.log(`code: ${err.code}`)
    : console.log(`Successfully connected to the database`);
});

module.exports = connection;

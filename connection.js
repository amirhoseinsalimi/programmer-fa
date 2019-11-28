const mysql = require('mysql');

const connection = mysql.createPool({
  host: '',
  user: '',
  password: '',
  database: '',
  connectionLimit: 10,
});

module.exports = connection;

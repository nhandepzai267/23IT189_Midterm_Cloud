const mongoose = require('mongoose');
require('dotenv').config();

// Kết nối tài khoản Read
const readConn = mongoose.createConnection(process.env.MONGO_URI_READ);
readConn.on('connected', () => console.log('Connected to MongoDB (Read Account)'));
readConn.on('error', (err) => console.error('Read DB Connection Error:', err));

// Kết nối tài khoản Write
const writeConn = mongoose.createConnection(process.env.MONGO_URI_WRITE);
writeConn.on('connected', () => console.log('Connected to MongoDB (Write Account)'));
writeConn.on('error', (err) => console.error('Write DB Connection Error:', err));

module.exports = { readConn, writeConn };
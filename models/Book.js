const mongoose = require('mongoose');
const { readConn, writeConn } = require('../config/db');

const bookSchema = new mongoose.Schema({
  productCode: { type: String, required: true },
  name: { type: String, required: true },
  priceBeforeTax: { type: Number, required: true },
  priceAfterTax: { type: Number, required: true },
  vatRate: { type: Number, required: true }
}, { timestamps: true });

// Phân luồng Model
const BookRead = readConn.model('Book', bookSchema, 'midterm_cloudcomputing');
const BookWrite = writeConn.model('Book', bookSchema, 'midterm_cloudcomputing');

module.exports = { BookRead, BookWrite };
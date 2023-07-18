const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    description: {
      type: String
    },
    alcoholP: {
      type: Number
    },
    picture: {
      type: String
    }
  });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;

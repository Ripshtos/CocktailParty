const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    ref: "User",
    required: true,
  },
  products: [{
    productId: {
      type: String,
      ref: 'Product' 
    },
    quantity: Number
  }],
  orderDate: {
    type: Date,
    default: Date.now,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;

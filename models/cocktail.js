const mongoose = require('mongoose');

const cocktailSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  alcoholic: {
    type: String,
    required: true
  },
  glass: {
    type: String,
    required: true
  },
  instructions: {
    type: String,
    required: true
  },
  ingredients: [
    {
      name: {
        type: String,
        required: true
      },
      measure: {
        type: String,
        required: true
      }
    }
  ],
  imageURL: {
    type: String,
    required: true
  }
});

const Cocktail = mongoose.model('Cocktail', cocktailSchema);
module.exports = Cocktail;

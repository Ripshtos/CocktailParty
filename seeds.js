/*
this connects to the server and inserts products into the mongodb db
*/

const { default: mongoose } = require("mongoose");

const Product = require('./models/product')

mongoose.connect('mongodb://localhost:27017/CocktailParty', { useNewUrlParser: true })
    .then(() => {
        console.log("mongo connection open!!");
    }).catch(err => {
        console.log("no connection start");
    })

// const p = new Product({
//     name: ' Ruby',
//     price: 1.99,
//     category: 'fruit'
// })
// p.save().then(p => {
//     console.log(p)
// })
//     .catch(e => {
//         console.log(e)

//     })
const seedProducts = [
    {
        name: 'fairy eggplant',
        price: 1.00,
        category: 'vegetable'

    },
    {
        name: 'organic goddess',
        price: 4.8,
        category: 'fruit'
    },
    {
        name: 'celery',
        price: 1.50,
        category: 'fruit'
    }

]
Product.insertMany(seedProducts)
    .then(res => {
        console.log(res)
    })
    .catch(e => {
        console.log(e)
    })

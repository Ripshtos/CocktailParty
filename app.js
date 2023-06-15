const express = require("express");
const { default: mongoose } = require("mongoose");

const Product = require("./models/product");
const User = require("./models/users");

const app = express();

//set view engine to ejs

var bodyParser = require('body-parser');
app.set('view engine', 'ejs');

//set upp public directory to serve static files
app.use(express.static('public'));

//Initiate bodyParser to parse request body
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());


mongoose
  .connect("mongodb://0.0.0.0:27017/CocktailParty", { useNewUrlParser: true })
  .then(() => {
    console.log("mongo connection open!!");
  })
  .catch((err) => {
    console.log("no connection start");
  });



app.get("/products/new", async (req, res) => {
  res.render("products/new");
});

app.get("/", async (req, res) => {
  res.render("products/index");
});

app.post("/products/r", async (req, res) => {
  const newProduct = new Product(req.body);
  await newProduct.save();
  res.redirect(`/product/${newProduct._id}`);
});

app.post("/users/r", async (req, res) => {
  const newUser = new User(req.body);
  await newUser.save();
 
});





app.get("/users/registration", async (req, res) => {
  res.render("users/registration");
});


app.get("/products", async (req, res) => {
  const products = await Product.find({});
  console.log(products);
  res.render("products/index", { products });
});

app.get("/product/:id", async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  res.render("products/show", { product });
});


app.listen(3000, () => {
  console.log("listening on port 3000!");
});

//************ */

// app.use((req, res) => {

//     console.log("we got a new request");
//     res.send("<h1> we got your request ! thank you </h1>");
// });
//app.get('/', (req, res) => {

//     res.render('home.ejs');
// });
// app.get('/search', (req, res) => {

//     const { q } = req.query.split('&');
//     if (!q) {
//         res.send("error this is null");
//     }
//     else {
//         res.send(`this is the ${q[0]}  and ${q[1]} page`);
//     }

// })

// app.get('/r/:subreddit', (req, res) => {

//     const { subreddit } = req.params;
//     res.send(`this is my ${subreddit} page`);
// });

// app.get('/r/:subreddit/:postid', (req, res) => {

//     const { subreddit, postid } = req.params;
//     res.send(` this is the page of ${subreddit} and ${postid}`);
// });

// app.get('/cats', (req, res) => {

//     res.send("<h1> we got your request ! thank you from cats  </h1>");
// });

// app.get('/dogs', (req, res) => {

//     res.send("<h1> we got your request ! thank you from dogs </h1>");
// });

// app.get('*', (req, res) => {

//     res.send("<h1> i dont know what you want  </h1>");
// });

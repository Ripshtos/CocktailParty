// project settings
const express = require("express");
const { default: mongoose } = require("mongoose");

nextSessionId = 1;

const app = express();

const Product = require("./models/product");
const User = require("./models/users");


var bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

//set view engine to ejs
app.set('view engine', 'ejs');
app.use(cookieParser()); // initializing the lib
//set upp public directory to serve static files
app.use(express.static('public'));

// sessionID -> username
const SESSIONS = {}

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());


// connection to mongo 

const username = encodeURIComponent('cocktail');
const password = encodeURIComponent('1234');
const database = 'CocktailParty'; // Replace with your desired database name

const uri = `mongodb+srv://${username}:${password}@cocktailparty.noij63l.mongodb.net/${database}?retryWrites=true&w=majority`;

mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connection open!!");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB:", err);
  });



//routes

app.get("/", async (req, res) => {
  const sessionId = req.cookies.sessionId;
  const username = SESSIONS[sessionId];
  const isLoggedIn = !!username; // Check if the username exists in SESSIONS

  const admin = req.cookies.adminMode ? req.cookies.adminMode : 0;


  console.log(admin);

  res.render("products/index", { isLoggedIn , admin});

});


//products

app.get("/products", async (req, res) => {
  const products = await Product.find({});
  console.log(products);
  res.render("products/index", { products });
});

app.get("/product/:id", async (req, res) => { //shows the new product after editing/adding a new product
  const { id } = req.params;
  const product = await Product.findById(id);
  res.render("products/show", { product });
});

app.post("/products/r", async (req, res) => { // saves the new product from the admin console 
  const newProduct = new Product(req.body);
  await newProduct.save();
  res.redirect(`/product/${newProduct._id}`);
});

app.get('/products/:id/edit', async (req, res) => { // loads the product from the admin managent console
  try {
    const product = await Product.findById(req.params.id);
    res.render('products/edit', { product });
  } catch (error) {
    res.status(404).send('Product not found');
  }
});

app.post('/products/:id/e', async (req, res) => { // edits a specific item chosen from the admin console
  try {
    const { id } = req.params;
    const updatedProduct = req.body;
    await Product.findByIdAndUpdate(id, updatedProduct);
    res.redirect(`/product/${id}`);
  } catch (error) {
    res.status(404).send('Product not found');
  }
});

app.post('/products/:id/delete', async (req, res) => { // deletes a product from the admin console
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send('Invalid product ID');
    }
    
    const deletedProduct = await Product.findByIdAndRemove(id);
    
    if (!deletedProduct) {
      return res.status(404).send('Product not found');
    }
    
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error deleting product');
  }
});



//users 

app.post("/users/r", async (req, res) => { // create a new user
  const useremail = req.body.email;

  const user = await User.findOne({ email: useremail }); // Find a single user with the provided email

  if (user) {
    // If user with the email already exists, display an alert
    return res.send('<script>alert("User email already taken"); window.location.href = "/users/registration";</script>');
  } 
  else
  {
    const newUser = new User(req.body);
    newUser.admin = 0;

    try {
      await newUser.save();
      res.send('<script>alert("Created new user"); window.location.href = "/";</script>');
    } catch (error) {
      // Handle any error that occurs during user creation or saving
      console.error(error);
      res.status(500).send('<script>alert("Error creating user"); window.location.href = "/users/registration";</script>');
    }
  }

});

app.get("/users/registration", async (req, res) => {
  res.render("users/registration");
});


app.get("/users/login", async (req, res) => {
  res.render("users/login");
});


//admin routing 

app.get("/admin/hub", async (req, res) => {
  res.render("admin/hub");
});

app.get("/admin/add-product", async (req, res) => {
  res.render("products/new");
});
 
app.get("/admin/update-product", async (req, res) => {
  const products = await Product.find({});
  res.render("products/ProductManagment", { products });
});



//login and logout page
app.post('/login', async (req, res) => {
  const useremail = req.body.username;
  const password = req.body.password;

  const user = await User.findOne({ email: useremail }); // Find a single user with the provided email

  console.log(user);

  if (user && user.password === password) {
    // Check if a user was found and the passwords match

    res.cookie('sessionId', nextSessionId);
    SESSIONS[nextSessionId] = useremail;
    nextSessionId++;

    if (user.admin == 1) {
      res.cookie('adminMode', 1);
    }

    res.redirect('/');

  }

  else {
    res.send('<script>alert("wrong email or password"); window.location.href = "/users/login";</script>');
  }

});

// routing for logout
app.get('/users/logout', (req, res) => {
  const sessionId = req.cookies.sessionId;
  // deleting the sessionId from temporary database
  delete SESSIONS[sessionId];
  // clearing the stored cookies sessionId
  res.clearCookie('sessionId');
  res.clearCookie('adminMode');
  res.redirect('/');
})


//setup server
app.listen(3000, () => {
  console.log("listening on port 3000!");
});




    // app._router.stack.forEach(function(r){
    //   if (r.route && r.route.path){
    //     console.log(r.route.path)
    //   }
    // })
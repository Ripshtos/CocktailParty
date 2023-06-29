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

app.get("/products/new", async (req, res) => {
  res.render("products/new");
});

app.get("/", async (req, res) => {
  const sessionId = req.cookies.sessionId;
  const username = SESSIONS[sessionId];
  const isLoggedIn = !!username; // Check if the username exists in SESSIONS
  
  res.render("products/index.ejs", { isLoggedIn });
});

app.post("/products/r", async (req, res) => {
  const newProduct = new Product(req.body);
  await newProduct.save();
  res.redirect(`/product/${newProduct._id}`);
});

app.post("/users/r", async (req, res) => {
  const useremail = req.body.email;

  const user = await User.findOne({ email: useremail }); // Find a single user with the provided email
 
  if (user) {
    // If user with the email already exists, display an alert
    res.send('<script>alert("User email already taken"); window.location.href = "/users/registration";</script>');
    
  }
  else
  {
    const newUser = new User(req.body);
    await newUser.save();
    res.send('<script>alert("Created new user");</script>');
    res.redirect('/');
  }

});

app.get("/users/registration", async (req, res) => {
  res.render("users/registration");
});

app.get("/users/login", async (req, res) => {
  res.render("users/login");
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

//login page
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

    app._router.stack.forEach(function(r){
      if (r.route && r.route.path){
        console.log(r.route.path)
      }
    })

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
  res.redirect('/');
})


//setup server
app.listen(3000, () => {
  console.log("listening on port 3000!");
});

const express = require("express");
const { default: mongoose } = require("mongoose");

nextSessionId = 1;

const app = express();

const Product = require("./models/product");
const User = require("./models/users");
const Cart = require("./models/cart");
const Order = require("./models/order");
const Cocktail = require('./models/cocktail');
const axios = require('axios');

var bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

//set view engine to ejs
app.set('view engine', 'ejs');
app.use(cookieParser()); // initializing the lib

//set upp public directory to serve static files
app.use(express.static('public'));

app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'ch-ua-form-factor=();');
  next();
});


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

// facebook
const pageId = '118027441390101';
const accessToken = 'EAAEjSpWPHsQBOxKZBscMTp1rxCxUDa4AM0ayapWLcFAxjhw6SyDkNoTxR7A3Bdqf8ZBXJUGfZAkEwwuusvnA4o99pNxLHCY5v0iAMfZC5Lge2PJzaiSyfF1UPOyfPfZAZAqxyuYhe4eC7NejZCtPEODWhPnU3XqZBU9DWTWhFgDtrV1UuA1o1kalpMbC2ZBh8UmEZD';



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
// Middleware to check if a user is logged in
const isLoggedInMiddleware = (req, res, next) => {
  const isLoggedIn = !!req.cookies.userEmail;
  const admin = req.cookies.adminMode ? req.cookies.adminMode : 0;
  
  res.locals.isLoggedIn = isLoggedIn; // Make isLoggedIn available in templates
  res.locals.admin = admin; // Make admin available in templates
  
  next();
};

// Define your routes using the isLoggedInMiddleware
app.use(isLoggedInMiddleware);

app.get("/", async (req, res) => {
  const q = req.query.q;
  const sort = req.query.sort;

  const products = await Product.find({
    name: { $regex: new RegExp(q, "i") },
  });

  if (sort === "price_asc") {
    products.sort((a, b) => a.price - b.price);
  } else if (sort === "price_desc") {
    products.sort((a, b) => b.price - a.price);
  }

  res.render("products/index", { products });
});

app.get("/products", async (req, res) => {
  const q = req.query.q;
  const sort = req.query.sort;

  const products = await Product.find({
    name: { $regex: new RegExp(q, "i") },
  });

  if (sort === "price_asc") {
    products.sort((a, b) => a.price - b.price);
  } else if (sort === "price_desc") {
    products.sort((a, b) => b.price - a.price);
  }

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
  
  const postMessage = `שלום חברים נוסף לאתר מוצר חדש !`;
  
  const apiEndpoint = `https://graph.facebook.com/${pageId}/feed`;
  try {
    const response = await axios.post(apiEndpoint, {
      message: postMessage,
      access_token: accessToken,
    });
  
    if (response.status === 200) {
      const json = { message: 'Posted to Facebook successfully' };
      res.render('products/show', {newProduct} )
    } else {
      const json = { error: response.data };
      res.status(response.status).json(json);
    }
  } catch (error) {
    console.error('Error posting to Facebook:', error.response.data);
    const json = { error: 'An error occurred while posting to Facebook' };
    res.status(500).json(json);
  }

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

//cart

app.post("/cart", async (req, res) => {

  const productId = req.body.productId;
  const quantity = req.body.quantity;
  const userId = req.cookies.userEmail;

    // Validate the inputs

    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send("Product not found");
    }

    // Create a new cart item
    const cartItem = new Cart({
      productId,
      quantity,
      userId
    });

    // Save the cart item to the database
    await cartItem.save();
    
});


app.get("/cart", async (req, res) => {
  const userEmail = req.cookies.userEmail;
  const cartItems = await Cart.find({ userId: userEmail }).populate('productId');

  // Calculate the total price based on the cart items
  let totalPrice = 0;
  cartItems.forEach((cartItem) => {
    totalPrice += cartItem.productId.price * cartItem.quantity;
  });

  res.render("products/cart", { cartItems, totalPrice });
});


// Remove item from cart
app.get("/cart/remove/:id", async (req, res) => {
  const cartItemId = req.params.id;

    const removedCartItem = await Cart.findByIdAndRemove(cartItemId);

    if (!removedCartItem) {
      return res.status(404).send("Cart item not found");
    }

    res.redirect("/cart");
});


//checkout
app.post("/checkout", async (req, res) => {
  console.log("checkout");
  const userEmail = req.cookies.userEmail;

    // Fetch user's cart items
    const cartItems = await Cart.find({ userId: userEmail }).populate('productId');

  // Calculate the total price based on the cart items
  let totalPrice = 0;
  cartItems.forEach((cartItem) => {
    totalPrice += cartItem.productId.price * cartItem.quantity;
  });
   
  console.log(totalPrice);
    // Create a new order
    const newOrder = new Order({
      userEmail,
      products: cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      totalAmount: totalPrice,
    });

    // Save the order
    await newOrder.save();

    // Clear the user's cart
    await Cart.deleteMany({ userEmail });

    
    res.redirect("/"); // Redirect to a thank you or confirmation page
  });


//admin routing 

app.get("/admin/hub", async (req, res) => {
  res.render("admin/hub");
});

app.get("/admin/add-product", async (req, res) => {
  res.render("admin/new");
});

app.get("/admin/list-user-orders", async (req, res) => {
  try {
    // Fetch orders
    const orders = await Order.find();
    console.log(orders);
    res.render("admin/orders", { orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).send("Internal Server Error");
  }
});
 
app.get("/admin/update-product", async (req, res) => {
  const products = await Product.find({});
  res.render("admin/ProductManagment", { products });
});

//charts 
app.get('/admin/chart', async (req, res, next) => {
  try {

    const orders = await Order.find();

      let totalSumOfJanuary = 0;
      let totalSumOfFebruary = 0;
      let totalSumOfMarch = 0;
      let totalSumOfApril = 0;
      let totalSumOfMay = 0;
      let totalSumOfJune = 0;
      let totalSumOfJuly = 0;
      let totalSumOfAugust = 0;
      let totalSumOfSeptember = 0;
      let totalSumOfOctober = 0;
      let totalSumOfNovember = 0;
      let totalSumOfDecember = 0;
      let totalOfAllSofar = 0;


      var targetMonth = 0;

      targetMonth = 0;
      orders.forEach((order) => {
          const orderDate = new Date(order.orderDate);
          if (orderDate.getMonth() === targetMonth) {
              totalSumOfJanuary += order.totalAmount;
          }
      });

      targetMonth = 1;
      orders.forEach((order) => {
          const orderDate = new Date(order.orderDate);
          if (orderDate.getMonth() === targetMonth) {
              totalSumOfFebruary += order.totalAmount;
          }
      });

      targetMonth = 2;
      orders.forEach((order) => {
          const orderDate = new Date(order.orderDate);
          if (orderDate.getMonth() === targetMonth) {
              totalSumOfMarch += order.totalAmount;
          }
      });


      targetMonth = 3;
      orders.forEach((order) => {
          const orderDate = new Date(order.orderDate);
          if (orderDate.getMonth() === targetMonth) {
              totalSumOfApril += order.totalAmount;
          }
      });


      targetMonth = 4;
      orders.forEach((order) => {
          const orderDate = new Date(order.orderDate);
          if (orderDate.getMonth() === targetMonth) {
              totalSumOfMay += order.totalAmount;
          }
      });


      targetMonth = 5;
      orders.forEach((order) => {
          const orderDate = new Date(order.orderDate);
          if (orderDate.getMonth() === targetMonth) {
              totalSumOfJune += order.totalAmount ;
          }
      });


      targetMonth = 6;
      orders.forEach((order) => {
          const orderDate = new Date(order.orderDate);
          if (orderDate.getMonth() === targetMonth) {
              totalSumOfJuly += order.totalAmount ;
          }
      });

      targetMonth = 7;
      orders.forEach((order) => {
          const orderDate = new Date(order.orderDate);
          if (orderDate.getMonth() === targetMonth) {
              totalSumOfAugust += order.totalAmount ;
          }
      });


      targetMonth = 8;
      orders.forEach((order) => {
          const orderDate = new Date(order.orderDate);
          if (orderDate.getMonth() === targetMonth) {
              totalSumOfSeptember += order.totalAmount;
          }
      });


      targetMonth = 9;
      orders.forEach((order) => {
          const orderDate = new Date(order.orderDate);
          if (orderDate.getMonth() === targetMonth) {
              totalSumOfOctober += order.totalAmount ;
          }
      });


      targetMonth = 10;
      orders.forEach((order) => {
          const orderDate = new Date(order.orderDate);
          if (orderDate.getMonth() === targetMonth) {
              totalSumOfNovember += order.totalAmount;
          }
      });


      targetMonth = 11;
      orders.forEach((order) => {
          const orderDate = new Date(order.orderDate);
          if (orderDate.getMonth() === targetMonth) {
              totalSumOfDecember += order.totalAmount ;
          }
      });

      orders.forEach((order) => {
          totalOfAllSofar += order.totalAmount ;

      });



      res.render('admin/chart', {
          totalSumOfJanuary, totalSumOfFebruary,
          totalSumOfMarch, totalSumOfApril, totalSumOfMay,
          totalSumOfJune, totalSumOfJuly,
          totalSumOfAugust, totalSumOfSeptember, totalSumOfOctober, totalSumOfNovember, totalSumOfDecember,
          totalOfAllSofar
      });
  } catch (error) {
      console.error('error with orders:', error);
      res.status(500).render('error');
  }
});


app.get('/admin/chart2', async (req, res, next) => {
  try {

    const users = await User.find();

      let totalSumOfJanuary = 0;
      let totalSumOfFebruary = 0;
      let totalSumOfMarch = 0;
      let totalSumOfApril = 0;
      let totalSumOfMay = 0;
      let totalSumOfJune = 0;
      let totalSumOfJuly = 0;
      let totalSumOfAugust = 0;
      let totalSumOfSeptember = 0;
      let totalSumOfOctober = 0;
      let totalSumOfNovember = 0;
      let totalSumOfDecember = 0;
      let totalOfAllSofar = 0;


      var targetMonth = 0;

      targetMonth = 0;
      users.forEach((user) => {
          const orderDate = new Date(user.birthday);
          if (orderDate.getMonth() === targetMonth) {
              totalSumOfJanuary += 1;
          }
      });

      targetMonth = 1;
      users.forEach((user) => {
          const orderDate = new Date(user.birthday);
          if (orderDate.getMonth() === targetMonth) {
              totalSumOfFebruary += 1;
          }
      });

      targetMonth = 2;
      users.forEach((user) => {
          const orderDate = new Date(user.birthday);
          if (orderDate.getMonth() === targetMonth) {
              totalSumOfMarch += 1 ;
          }
      });


      targetMonth = 3;
      users.forEach((user) => {
          const orderDate = new Date(user.birthday);
          if (orderDate.getMonth() === targetMonth) {
              totalSumOfApril += 1;
          }
      });


      targetMonth = 4;
      users.forEach((user) => {
          const orderDate = new Date(user.birthday);
          if (orderDate.getMonth() === targetMonth) {
              totalSumOfMay += 1;
          }
      });


      targetMonth = 5;
      users.forEach((user) => {
          const orderDate = new Date(user.birthday);
          if (orderDate.getMonth() === targetMonth) {
              totalSumOfJune += 1 ;
          }
      });


      targetMonth = 6;
      users.forEach((user) => {
          const orderDate = new Date(user.birthday);
          if (orderDate.getMonth() === targetMonth) {
              totalSumOfJuly += 1 ;
          }
      });

      targetMonth = 7;
      users.forEach((user) => {
          const orderDate = new Date(user.birthday);
          if (orderDate.getMonth() === targetMonth) {
              totalSumOfAugust += 1 ;
          }
      });


      targetMonth = 8;
      users.forEach((user) => {
          const orderDate = new Date(user.birthday);
          if (orderDate.getMonth() === targetMonth) {
              totalSumOfSeptember += 1;
          }
      });


      targetMonth = 9;
      users.forEach((user) => {
          const orderDate = new Date(user.birthday);
          if (orderDate.getMonth() === targetMonth) {
              totalSumOfOctober += 1 ;
          }
      });


      targetMonth = 10;
      users.forEach((user) => {
          const orderDate = new Date(user.birthday);
          if (orderDate.getMonth() === targetMonth) {
              totalSumOfNovember += 1;
          }
      });


      targetMonth = 11;
      users.forEach((user) => {
          const orderDate = new Date(user.birthday);
          if (orderDate.getMonth() === targetMonth) {
              totalSumOfDecember += 1 ;
          }
      });

      users.forEach((user) => {
          totalOfAllSofar++ ;

      });



      res.render('admin/chart2', {
          totalSumOfJanuary, totalSumOfFebruary,
          totalSumOfMarch, totalSumOfApril, totalSumOfMay,
          totalSumOfJune, totalSumOfJuly,
          totalSumOfAugust, totalSumOfSeptember, totalSumOfOctober, totalSumOfNovember, totalSumOfDecember,
          totalOfAllSofar
      });
  } catch (error) {
      console.error('error with orders:', error);
      res.status(500).render('error');
  }
});



//login and logout page
app.post('/login', async (req, res) => {
  const useremail = req.body.username.trim();
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

    res.cookie('userEmail' , user.email );
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
  res.clearCookie('userEmail');
  res.redirect('/');
})

//orders

app.get("/orders", async (req, res) => {
  // Get the currently logged-in user's email from the authentication mechanism
  const userEmail = req.cookies.userEmail; 

  try {
    // Fetch orders for the logged-in user
    const orders = await Order.find({ userEmail });
    res.render("users/orders", { orders });
    
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).send("Internal Server Error");
  }
});


app.get("/orders/:id", async (req, res) => {
  const orderId = req.params.id;
  const userEmail = req.cookies.userEmail;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).send("Invalid order ID");
  }

  try {
    // Fetch the order with the specified orderId and matching userEmail
    const order = await Order.findOne({ _id: orderId, userEmail }).populate("products.productId");

    if (!order) {
      return res.status(404).send("Order not found");
    }

    res.render("users/orderDetails", { order });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).send("Internal Server Error");
  }
});


app.get("/cocktails", async (req, res) => {
  let cocktails = [];

  const requests = Array.from({ length: 20 }).map(async () => {
      const response = await axios.get('https://www.thecocktaildb.com/api/json/v1/1/random.php');
      const cocktailDetails = response.data.drinks[0];
      
      let ingredientsArray = [];
      for(let i = 1; i <= 15; i++) {
          if(cocktailDetails['strIngredient' + i] && cocktailDetails['strMeasure' + i]) {
              ingredientsArray.push({
                  name: cocktailDetails['strIngredient' + i],
                  measure: cocktailDetails['strMeasure' + i]
              });
          }
      }
      
      const newCocktail = new Cocktail({
          name: cocktailDetails.strDrink,
          category: cocktailDetails.strCategory,
          alcoholic: cocktailDetails.strAlcoholic,
          glass: cocktailDetails.strGlass,
          instructions: cocktailDetails.strInstructions,
          ingredients: ingredientsArray,
          imageURL: cocktailDetails.strDrinkThumb,
      });

      try {
          await newCocktail.save();
          cocktails.push(newCocktail);
      } catch (error) {
          console.error('Failed to save cocktail:', error);
      }
  });

  await Promise.all(requests);

  res.render("cocktails/index", { cocktails: cocktails});
});



//setup server
app.listen(3000, () => {
  console.log("listening on port 3000!");
});

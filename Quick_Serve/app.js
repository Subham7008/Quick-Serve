const express = require("express");
require("dotenv").config();
const cors = require("cors");
const sendResponse = require("./middlewares/response.middleware");
const handleNotFound = require("./middlewares/notFound.middleware");
const errorHandler = require("./middlewares/errorHandler.middleware");
const userRouter = require("./routes/user.router");
const shopOwnerRouter = require("./routes/shop_owners.router");
const customerRouter = require("./routes/customer.router");

const app = express();
const port = process.env.APP_PORT;
const baseUrl = process.env.BASE_URL;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sendResponse);

// router middlewares  
app.use("/api/users", userRouter);
app.use("/api/shop-owners", shopOwnerRouter);
app.use("/api/customers", customerRouter);

// Middleware for handling 404 errors for API routes
app.use(handleNotFound);

// Middleware for handling catch errors for API routes
app.use(errorHandler);

const connectDB = require('./config/db');

async function startServer() {
  try {
    await connectDB();
    
    app.listen(port, () => {
      console.log(`Server running at : ${baseUrl}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

startServer();

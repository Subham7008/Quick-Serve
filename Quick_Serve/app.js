const express = require("express");
require("dotenv").config();
const cors = require("cors");
const sendResponse = require("./middlewares/response.middleware");
const handleNotFound = require("./middlewares/notFound.middleware");
const errorHandler = require("./middlewares/errorHandler.middleware");
const userRouter = require("./routes/user.router");
const shopOwnerRouter = require("./routes/shop_owners.router");
const customerRouter = require("./routes/customer.router");
const serviceRequestRouter = require("./routes/service_requests.router");

const app = express();
const port = process.env.APP_PORT;
const baseUrl = process.env.BASE_URL;

app.use(cors({
  origin: ['https://quick-serve-production.up.railway.app', 'http://localhost:5173', 'https://quick-serve-anubce8cv-subham-shankar-sahoos-projects.vercel.app', 'https://quick-serve-lt8ap4a3z-subham-shankar-sahoos-projects.vercel.app', 'https://quick-serve-six.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sendResponse);

// router middlewares  
app.use("/api/users", userRouter);
app.use("/api/shop-owners", shopOwnerRouter);
app.use("/api/customers", customerRouter);
app.use("/api/service-requests", serviceRequestRouter);

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

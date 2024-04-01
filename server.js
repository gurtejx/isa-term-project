/**
 * Server.js file: Set up and configure Express server, create DB connection, 
 * define routes, and start the server listening for incoming requests.
 */
import express from 'express';
import cors from 'cors';
import MongoService from "./utilities/mongo_service.js";
import authRoutes from "./routes/auth_routes.js";
import MongoDBStore from "connect-mongodb-session";
import logged_in_check from './utilities/auth_middleware.js';
import path from 'path';
import session from 'express-session';
import dotenv from "dotenv";
dotenv.config();

const mongo = new MongoService();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(path.resolve(), "views"));
app.use(express.static(path.join(path.resolve(), "public")));

const cors_options = {
  origin: '*',
  optionsSuccessStatus: 200 
}
app.use(cors(cors_options));
// Define routes
app.get('/', (req, res) => {
    res.render("landingPage");
});

// Set up session storage
let mongoSessionStore = new MongoDBStore(session);
const mongoStore = new mongoSessionStore({
  uri: process.env.MONGODB_URI || `mongodb://127.0.0.1:27017/`,
  dbName: "isa_term_proj",
  collection: "sessions",
});

mongoStore.on("error", (error) => {
  console.log("Session store error: " + error);
});

// Configure session middleware
app.use(session({
  secret: process.env.NODE_SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: mongoStore,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true, 
    sameSite: true 
  }
}));

app.use('/', authRoutes);

app.get('/admin', (req, res) => {
  res.render("admin");
});

// Start Express server
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
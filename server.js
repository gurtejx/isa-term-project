/**
 * Server.js file: Set up and configure Express server, create DB connection, 
 * define routes, and start the server listening for incoming requests.
 */
import express from 'express';
import cors from 'cors';
import MongoService from "./utilities/mongo_service.js";
import path from 'path';
import session from 'express-session';
import dotenv from "dotenv";
dotenv.config();

const mongo = new MongoService();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.NODE_SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: {
      httpOnly: true
  }
}));
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

// Start Express server
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
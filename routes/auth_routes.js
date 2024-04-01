/**
 * This file contains routes for handling authentication functions.
 */
import express from 'express';
import session from "express-session";
import MongoDBStore from "connect-mongodb-session";
import MongoService from "../utilities/mongo_service.js";
import bcrypt from 'bcrypt';
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const mongo = new MongoService();

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
router.use(session({
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

// Route for user sign-in
router.post('/signin', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Set session data
    req.session.userId = user._id;
    res.status(200).json({ message: 'Sign-in successful' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/signup', async (req, res) => {
  const { firstname, email, password } = req.body;
  const User = mongo.models.User;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ firstname, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
    res.render("landlingPage");
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


export default router;
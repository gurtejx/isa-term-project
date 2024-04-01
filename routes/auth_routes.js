/**
 * This file contains routes for handling authentication functions.
 */
import express from 'express';
import session from "express-session";
import MongoService from "../utilities/mongo_service.js";
import bcrypt from 'bcrypt';
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const mongo = new MongoService();

// Route for user sign-in
// Route for user sign-in
router.post('/signin/password', async (req, res) => {
  const { email, password } = req.body;
  const User = mongo.models.User;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    console.log("user: " + user);
    // Set session data (consider user as logged in)
    req.session.userId = user._id;
    req.session.authenticated = true;

    // Set req.user to the authenticated user
    req.user = user;

    // Redirect to landing page
    res.redirect('/');
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// Route for user sign-up
router.post('/signup', async (req, res) => {
  const { firstname, email, password } = req.body;
  const User = mongo.models.User;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User with email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ firstname, email, password: hashedPassword });
    await newUser.save();

    // Set session data (consider user as logged in)
    req.session.userId = newUser._id;

    // Redirect to landing page
    res.redirect('/');
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/signin', (req, res) => {
  res.render("signin");
});

router.get('/signup', (req, res) => {
  res.render("signup");
});


export default router;
/**
 * This file contains routes for handling authentication functions.
 */
import express from 'express';
import MongoService from "../utilities/mongo_service.js";
import bcrypt from 'bcrypt';
import dotenv from "dotenv";
import jwt from 'jsonwebtoken';
dotenv.config();

const router = express.Router();
const mongo = new MongoService();

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

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '3h' });

    // Set the token as a cookie and then redirect
    res.cookie('token', token, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 3 * 60 * 60 * 1000 });
    res.redirect('/');
  } catch (error) {
    console.error(error);
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

    // Redirect to landing page or wherever appropriate
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route for user logout
router.post('/logout', (req, res) => {
  try {
    // Clear the token cookie
    res.clearCookie('token');
    // Redirect to the login page or wherever appropriate
    res.redirect('/signin');
  } catch (error) {
    console.error(error);
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
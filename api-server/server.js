/**
 * Server.js file: Set up and configure Express server, create DB connection,
 * define routes, and start the server listening for incoming requests.
 */
import express from 'express';
import cors from 'cors';
import MongoService from "./utilities/mongo_service.js";
import { isLoggedIn, isAdmin } from './utilities/auth_middleware.js';
import path from 'path';
import cookie_parser from 'cookie-parser';
import dotenv from "dotenv";
import bcrypt from 'bcrypt';
import notifier from "node-notifier";
import nodemailer from "nodemailer";
import Mailgen from "mailgen";
import jwt from 'jsonwebtoken';

dotenv.config();

const mongo = new MongoService();
const app = express();

app.use(express.json());
app.use(cookie_parser());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", "./client-app/views");
app.use(express.static("./client-app/public"));

const cors_options = {
    origin: '*',
    optionsSuccessStatus: 200
}
app.use(cors(cors_options));

dotenv.config();

const router = express.Router();

// Define routes
app.get('/', isLoggedIn, (req, res) => {
    const isLoggedIn = req.verified ? true : false;
    res.render("landingPage", { isLoggedIn: isLoggedIn });
});

app.use('/', router);

app.get('/admin', isLoggedIn, isAdmin, (req, res) => {
    res.render("admin");
});
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
        if (isAdmin) { res.redirect('/admin'); } else { res.redirect('/'); }
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

// Route for forgot password page
router.get('/forgotPassword', (req, res) => {
    res.render('forgotPassword');
});

// Route for handling submission of email for password reset
router.post('/sendResetEmail', async (req, res) => {
    const userEmail = req.body.email;

    // Validate email
    if (!userEmail) {
        res.redirect('/forgotPassword');
        return;
    }

    // Check if email exists in database
    const user = await mongo.models.User.findOne({ email: userEmail });
    if (!user) {
        res.redirect('/forgotPassword');
        return;
    }
    const firstname = user.firstname;

    // Generate token for password reset
    const secret = process.env.JWT_SECRET + user.password;
    const payload = {
        email: user.email,
        id: user._id
    };
    const token = jwt.sign(payload, secret, { expiresIn: '15m' });
    const resetLink = `http://localhost:8000/setNewPassword/${user._id}/${token}`;

    // Send password reset email
    try {
        // Create a Nodemailer transporter
        const config = {
            service: process.env.EMAIL_SERVICE_PROVIDER,
            auth: {
                user: process.env.APP_EMAIL,
                pass: process.env.APP_EMAIL_PASSWORD,
            },
        };
        let transporter = nodemailer.createTransport(config);

        let Mailgenerator = new Mailgen({
            theme: "default",
            product: {
                name: "Mailgen",
                link: "https://mailgen.js/",
            },
        });

        let response = {
            req: req,
            body: {
                name: firstname,
                intro: `Voila! We got you covered!.`,
                action: {
                    instructions: "To reset your password, click the button below:",
                    button: {
                        text: "Reset Password",
                        link: resetLink,
                    },
                },
                outro: `If you have any questions, feel free to contact us at ${process.env.APP_EMAIL}.`
            },
        };

        let emailToBeSent = Mailgenerator.generate(response);

        // Define the email options
        let mailOptions = {
            from: process.env.APP_EMAIL,
            to: userEmail,
            subject: "Reset Your Password",
            html: emailToBeSent,
        };

        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                // Display a notification alert
                notifier.notify({
                    title: "Alert",
                    message: "Failed to send email: " + error,
                });
                console.log(error);
                res.redirect("/");
            } else {
                // Display a notification alert
                notifier.notify({
                    title: "Alert",
                    message: "Email sent: " + info.response,
                });
                console.log("Email sent: " + info.response);
                res.redirect("/");
            }
        });

        res.redirect('/signin');
    } catch (error) {
        console.error(error);
        res.redirect('/forgotPassword');
    }
});

// Route for setting new password
router.get('/setNewPassword/:userId/:token', async (req, res) => {
    const { userId, token } = req.params;

    // Verify token
    try {
        const user = await mongo.models.User.findById(userId);
        if (!user) {
            res.redirect('/forgotPassword');
            return;
        }

        const secret = process.env.JWT_SECRET + user.password;
        const decodedToken = jwt.verify(token, secret);

        // Token is valid, render page for setting new password
        res.render('setNewPassword', { userId, token });
    } catch (error) {
        console.error(error);
        res.redirect('/pageDoesNotExist');
    }
});

router.post("/updatePassword", async (req, res) => {
    const newPassword = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const userId = req.body.userId;

    if (!newPassword || !confirmPassword) {
        return res.redirect("/setNewPassword");
    }

    if (newPassword !== confirmPassword) {
        return res.redirect("/setNewPassword");
    }

    try {
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password in the database
        await mongo.models.User.findOneAndUpdate(
            { _id: userId },
            { $set: { password: hashedPassword } }
        );

        // Display success message
        console.log("Password updated successfully!");
        res.redirect("/signin"); // Redirect to login page
    } catch (error) {
        console.error("Failed to update password:", error);
        // Display error message
        res.redirect("/setNewPassword?error=true");
    }
});


// Start Express server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
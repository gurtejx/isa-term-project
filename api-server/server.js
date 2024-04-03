/**
 * Server.js file: Set up and configure Express server, create DB connection,
 * define routes, and start the server listening for incoming requests.
 */
import express from 'express';
import cors from 'cors';
import MongoService from "./utilities/mongo_service.js";
import authRoutes from "./routes/auth_routes.js";
import {isLoggedIn, isAdmin} from './utilities/auth_middleware.js';
import path from 'path';
import cookie_parser from 'cookie-parser';
import dotenv from "dotenv";

dotenv.config();

const mongo = new MongoService();
const app = express();

app.use(express.json());
app.use(cookie_parser());
app.use(express.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.set("views", path.join(path.resolve(), "../client-app/views"));
app.use(express.static(path.join(path.resolve(), "../client-app/public")));

const cors_options = {
    origin: '*',
    optionsSuccessStatus: 200
}
app.use(cors(cors_options));

// Define routes
app.get('/', isLoggedIn, (req, res) => {
    const isLoggedIn = req.verified ? true : false;
    res.render("landingPage", {isLoggedIn: isLoggedIn});
});

app.use('/', authRoutes);

app.get('/admin', isLoggedIn, isAdmin, (req, res) => {
    res.render("admin");
});

// Start Express server
const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
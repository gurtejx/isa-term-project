/**
 * Server.js file: Set up and configure Express server, create DB connection, 
 * define routes, and start the server listening for incoming requests.
 */
import express from 'express';
import cors from 'cors';
import MongoService from "./utilities/mongo_service.js";

const mongo = new MongoService();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const cors_options = {
  origin: '*',
  optionsSuccessStatus: 200 
}
app.use(cors(cors_options));

// Define routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Start Express server
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
import jwt from 'jsonwebtoken';
import MongoService from "../utilities/mongo_service.js";
const mongo = new MongoService();

export function isLoggedIn(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    req.verified = false;
    return res.redirect('/signin');
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodedToken; // Attach decoded user data to req object
    req.verified = true;
    console.log(req.user);
    next();
  } catch (error) {
    console.log(error);
    return res.redirect('/signin');
  }
}

export async function isAdmin(req, res, next) {
  // Check if user is authenticated
  if (!req.verified) {
    return res.status(401).json({ message: 'Unauthorized. User not authenticated.' });
  }

  try {
    const user = await mongo.models.User.findById(req.user.userId);

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access forbidden. Admin role required.' });
    }

    // User is authenticated and is admin, continue to next middleware or route handler
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
import { auth } from '../config/firebase.js';
import { ROLES } from '../config/constants.js';

/**
 * Verify Firebase ID token
 */
export const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Check if user is admin
 */
export const isAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const user = await auth.getUser(req.user.uid);
    const customClaims = user.customClaims || {};

    if (customClaims.role !== ROLES.ADMIN) {
      return res.status(403).json({ error: 'Forbidden - Admin access required' });
    }

    next();
  } catch (error) {
    return res.status(403).json({ error: 'Forbidden' });
  }
};

/**
 * Check admin secret key (fallback authentication)
 */
export const verifyAdminSecret = (req, res, next) => {
  const secretKey = req.headers['x-admin-secret'];

  if (secretKey !== process.env.ADMIN_SECRET_KEY) {
    return res.status(403).json({ error: 'Invalid admin secret' });
  }

  next();
};

export default { verifyToken, isAdmin, verifyAdminSecret };

const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'supersecret';

function getUserFromToken(token) {
  try {
    if (!token) return null;
    const decoded = jwt.verify(token.replace('Bearer ', ''), SECRET);
    return decoded;
  } catch (err) {
    return null;
  }
}

module.exports = { getUserFromToken, SECRET };

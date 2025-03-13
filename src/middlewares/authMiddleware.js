const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  // const authHeader = req.headers['authorization'];
  // const token = authHeader && authHeader.split(' ')[1];
  const token = req.headers['token'];

  if (!token)
    return res
      .status(401)
      .json({ status: 401, message: 'Access token required' });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err)
      return res
        .status(403)
        .json({ status: 403, message: 'Invalid access token' });
    req.user = user;
    next();
  });
};

const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ status: 401, message: 'Permission denied' });
    }
    next();
  };

module.exports = { authenticateToken, restrictTo };

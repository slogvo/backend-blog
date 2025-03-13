const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const {
  authenticateToken,
  restrictTo,
} = require('../middlewares/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post(
  '/register-admin',
  authenticateToken,
  restrictTo('admin'),
  authController.registerAdmin,
);
// router.get('/protected', authenticateToken, (req, res) => {
//   res.json({ message: 'Protected data', user: req.user });
// });

module.exports = router;

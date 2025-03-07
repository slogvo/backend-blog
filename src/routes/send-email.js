// routes/send-email.js
const express = require('express');
const router = express.Router();
const { sendEmail } = require('../controllers/emailController');

const v1Router = express.Router();
// router.use('/v1', v1Router);
router.use(v1Router);

router.post('/send-email', sendEmail);

module.exports = router;

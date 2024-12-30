const express = require('express');
const { loginUser,adminLogin } = require('../controllers/authController');

const router = express.Router();

router.post('/login', loginUser);
router.post('/admin', adminLogin);


module.exports = router;

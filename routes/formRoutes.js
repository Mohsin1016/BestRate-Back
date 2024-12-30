const express = require('express');
const multer = require('multer');
const { submitForm } = require('../controllers/formController');
const { protectAdmin } = require('../middlewares/authMiddleware'); 

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/submit', upload.array('files'), submitForm);

module.exports = router;

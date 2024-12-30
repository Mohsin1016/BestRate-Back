const express = require('express');
const { getUsers, upsertUser, deleteUser,updateUser } = require('../controllers/adminController');
const { protectAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/users', protectAdmin, getUsers);
router.post('/user', protectAdmin, upsertUser);
router.delete('/user/:id', protectAdmin, deleteUser);
router.put('/user/:id', protectAdmin, updateUser);


module.exports = router;

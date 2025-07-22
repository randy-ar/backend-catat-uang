// routes/incomeRoutes.js
const express = require('express');
const router = express.Router();
const incomeController = require('../controllers/incomeController');
const authenticateToken = require('../middlewares/authMiddleware');

router.post('/', authenticateToken, incomeController.addIncome);
router.get('/', authenticateToken, incomeController.getIncomes);

module.exports = router;
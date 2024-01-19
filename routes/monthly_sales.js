const express = require("express");
const router = express.Router();
const monthlySalesController = require("../controllers/monthly_SalesController");

router.get("/monthly-sales", monthlySalesController.getMonthlySales);

module.exports = router;

const express = require("express");
const uploadRouter = require("./upload");
const monthlySales = require("./monthly_sales");

const router = express.Router();

router.use("/upload", uploadRouter);
router.use("/monthly-sales", monthlySales);

module.exports = router;

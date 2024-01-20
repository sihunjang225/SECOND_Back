const express = require("express");
const sequelize = require("./database/db");

const uploadRouter = require("./routes/upload.js");
const monthlySales = require("./routes/monthly_sales.js");
const customerRouter = require("./routes/customer");
const orderRouter = require("./routes/order");

const app = express();
app.use(express.json());

app.use("/", uploadRouter, monthlySales, customerRouter, orderRouter);

const PORT = process.env.PORT || 3000;

// 데이터베이스 연결 확인 및 동기화
sequelize
  .authenticate()
  .then(() => {
    console.log("데이터베이스 연결 성공");

    return sequelize.sync(); // 데이터베이스 동기화
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`${PORT} 서버가 실행되었습니다.`);
    });
  })
  .catch((err) => {
    console.error("데이터베이스 연결 또는 동기화 실패:", err);
  });

module.exports = app;

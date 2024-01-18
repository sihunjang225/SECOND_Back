const express = require("express");
const { Customer, Order } = require("./database/models/index.js");
const sequelize = require("./database/db");
const multer = require("multer");

const UploadRouter = require("./routes/upload.js");
const monthlySales = require("./routes/monthly_sales.js");

const app = express();
app.use(express.json());

app.use("/", UploadRouter, monthlySales);

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

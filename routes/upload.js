const express = require("express");
const router = express.Router();
const xlsx = require("xlsx");
const multer = require("multer");
const { Customer, Order } = require("../database/models");
const { Op, literal } = require("sequelize");

// Multer 설정
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("파일이 업로드되지 않았습니다.");
    }

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const customerSheetName = workbook.SheetNames[0];
    const customerSheet = workbook.Sheets[customerSheetName];
    const customerData = xlsx.utils.sheet_to_json(customerSheet);

    for (const customerItem of customerData) {
      if (customerItem["고객명"] && customerItem["고객등급"]) {
        const createdCustomer = await Customer.create({
          customer_name: customerItem["고객명"],
          customer_grade: customerItem["고객등급"],
        });
      }
    }

    const orderSheetName = workbook.SheetNames[1];
    const orderSheet = workbook.Sheets[orderSheetName];
    const orderData = xlsx.utils.sheet_to_json(orderSheet);

    for (const orderItem of orderData) {
      const orderDateString = orderItem["주문일자"];

      // 주문일자가 존재하는 경우에만 처리
      if (orderDateString) {
        try {
          let orderDate;

          // 만약 orderDateString이 숫자인 경우 (Excel 날짜 형식)
          if (typeof orderDateString === "number") {
            // Excel에서 날짜를 JavaScript Date 객체로 변환
            orderDate = new Date(Date.UTC(1900, 0, orderDateString - 1));
          } else if (typeof orderDateString === "string") {
            const dateParts = orderDateString.split("-");

            if (dateParts.length === 3) {
              const [year, month, day] = dateParts.map(Number);

              if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
                // JavaScript Date 객체 생성 시 월을 1 빼기
                orderDate = new Date(year, month - 1, day);
              } else {
                console.error("잘못된 날짜 형식:", orderDateString);
              }
            } else {
              console.error("잘못된 날짜 형식:", orderDateString);
            }
          } else {
            console.error(
              "잘못된 날짜 형식 - 문자열 또는 숫자 아님",
              orderDateString
            );
          }

          if (orderDate) {
            const relatedCustomer = await Customer.findOne({
              where: { customer_id: orderItem["주문고객 id"] },
            });

            if (relatedCustomer) {
              await Order.create({
                customer_id: relatedCustomer.customer_id,
                order_date: orderDate,
                order_type:
                  orderItem["주문타입"] === "order" ? "order" : "refund",
                order_amount: orderItem["주문금액"],
              });

              console.log("주문 생성됨:", orderItem);
            }
          }
        } catch (error) {
          console.error("날짜 처리 오류:", error);
        }
      }
    }

    return res
      .status(200)
      .send("파일 업로드 및 데이터베이스에 데이터 삽입 완료.");
  } catch (error) {
    console.error("파일 업로드 오류:", error);
    return res.status(500).send("내부 서버 오류");
  }
});

// customer, order 데이터 가져오기
router.get("/customers", async (req, res) => {
  try {
    const customers = await Customer.findAll();
    return res.json(customers);
  } catch (error) {
    console.error("고객 데이터 가져오기 오류:", error);
    return res.status(500).json({ error: "내부 서버 오류" });
  }
});

router.get("/orders", async (req, res) => {
  try {
    const { startDate, endDate, orderType, customerId, pageSize, pageNo } =
      req.query;

    // 페이지네이션에 필요한 값 설정 (http://localhost:3000/orders?pageNo=1&pageSize=50)
    const defaultPageNo = 1;
    const defaultPageSize = 50;
    const pageLimit = pageSize ? parseInt(pageSize, 10) : defaultPageSize;
    const pageNumber = pageNo ? parseInt(pageNo, 10) : defaultPageNo;

    // 쿼리 매개변수를 기반으로 필터 조건 정의
    const filterConditions = {};

    // 필터 a: 주문기간(시작일, 종료일) 내의 주문만 조회 (http://localhost:3000/orders?startDate=2023-01-01&endDate=2023-01-04)
    if (startDate && endDate) {
      filterConditions.order_date = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    // 필터 b: 주문만을 조회 or 반품만을 조회 (http://localhost:3000/orders?orderType=0)
    if (orderType !== undefined) {
      filterConditions.order_type = orderType === "1" ? "refund" : "order";
    }

    // 필터 c: 특정 고객의 주문(또는 반품, 또는 둘 다)만을 조회 (http://localhost:3000/orders?customerId=1) / (http://localhost:3000/orders?customerId=1&orderType=1)
    if (customerId !== undefined) {
      filterConditions.customer_id = customerId;
    }

    //a,b,c = 특정고객이 주문기간(시작일, 종료일) 내의 주문만을 조회
    // (http://localhost:3000/orders?customerId=1&startDate=2023-07-01&endDate=2023-07-31)

    // Sequelize를 사용하여 주문 목록 검색
    const totalDataCount = await Order.count({ where: filterConditions });

    const orders = await Order.findAll({
      attributes: [
        "order_id",
        "order_date",
        "order_type",
        "order_amount",
        "createdAt",
        "updatedAt",
      ],
      where: filterConditions,
      order: [
        ["order_date", "DESC"],
        ["order_id", "DESC"],
      ],
      limit: pageLimit,
      offset: Math.max(0, totalDataCount - pageNumber * pageLimit),
      include: [
        {
          model: Customer,
          attributes: ["customer_id", "customer_name", "customer_grade"],
        },
      ],
    });

    // 클라이언트 요구에 따라 필드를 선택하여 응답
    const extractedOrders = orders.map((order) => {
      return {
        // order_id: order.order_id,
        order_date: order.order_date,
        customer_name: order.Customer.customer_name,
        customer_grade: order.Customer.customer_grade,
        order_type: order.order_type === "order" ? 0 : 1,
        order_amount: order.order_amount,
      };
    });

    // startDate, endDate를 응답에 포함
    res.json({
      startDate,
      endDate,
      orders: extractedOrders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("내부 서버 오류");
  }
});

module.exports = router;

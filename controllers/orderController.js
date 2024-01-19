const { Op } = require("sequelize");
const { Order, Customer } = require("../database/models");

exports.getOrders = async (req, res) => {
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
};

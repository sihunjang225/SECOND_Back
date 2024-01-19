const { Op, literal, fn, col, Sequelize } = require("sequelize");
const { Order } = require("../database/models/index");

exports.getMonthlySales = async (req, res) => {
  try {
    const MonthlySales = await Order.findAll({
      attributes: [
        [
          Sequelize.literal(
            "SUM(CASE WHEN order_type = 'order' THEN order_amount ELSE 0 END)"
          ),
          "주문액",
        ],
        [
          Sequelize.literal(
            "SUM(CASE WHEN order_type = 'refund' THEN order_amount ELSE 0 END)"
          ),
          "반품액",
        ],
        [
          Sequelize.literal(
            "SUM(CASE WHEN order_type = 'order' THEN order_amount WHEN order_type = 'refund' THEN -order_amount ELSE 0 END)"
          ),
          "매출액",
        ],
        [fn("YEAR", col("order_date")), "년"],
        [fn("MONTH", col("order_date")), "월"],
      ],
      group: [fn("YEAR", col("order_date")), fn("MONTH", col("order_date"))],
      order: [fn("YEAR", col("order_date")), fn("MONTH", col("order_date"))],
    });

    const formattedSales = MonthlySales.map((item) => ({
      [`${item.getDataValue("년")}년 ${item.getDataValue(
        "월"
      )}월 주문액`]: `${Number(item.getDataValue("주문액")).toLocaleString(
        "en-US",
        {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }
      )}원`,
      [`${item.getDataValue("년")}년 ${item.getDataValue(
        "월"
      )}월 반품액`]: `${Number(item.getDataValue("반품액")).toLocaleString(
        "en-US",
        {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }
      )}원`,
      [`${item.getDataValue("년")}년 ${item.getDataValue(
        "월"
      )}월 매출`]: `${Number(item.getDataValue("매출액")).toLocaleString(
        "en-US",
        {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }
      )}원`,
    }));

    res.json(formattedSales);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "서버 오류" });
  }
};

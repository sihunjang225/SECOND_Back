const { Customer } = require("../database/models");

exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll();
    res.json(customers);
  } catch (error) {
    console.error("고객 데이터 가져오기 오류:", error);
    res.status(500).json({ error: "내부 서버 오류" });
  }
};

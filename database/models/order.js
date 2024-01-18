const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Order = sequelize.define("Order", {
  order_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  order_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  order_type: {
    type: DataTypes.ENUM("order", "refund"),
    allowNull: false,
  },
  order_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
});

module.exports = Order;

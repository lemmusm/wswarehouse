const sql = require('../config/dbConfig');

const SaleDetail = function (sale_detail) {
  this.quantity_sale = sale_detail.quantity_sale;
  this.price = sale_detail.price;
  this.tax = sale_detail.tax;
  this.discount = sale_detail.discount;
  this.amount = sale_detail.amount;
  this.sale_id = sale_detail.sale_id;
  this.product_id = sale_detail.product_id;
  this.payment_id = sale_detail.payment_id;
  this.is_deleted = sale_detail.is_deleted;
  this.created_at = sale_detail.created_at;
  this.updated_at = sale_detail.updated_at;
};

module.exports = SaleDetail;

const sql = require('../config/dbConfig');

const EntryDetail = function (entry_detail) {
  this.quantity_entry = entry_detail.quantity_entry;
  this.price = entry_detail.price;
  this.tax = entry_detail.tax;
  this.amount = entry_detail.amount;
  this.entry_id = entry_detail.entry_id;
  this.product_id = entry_detail.product_id;
  this.payment_id = entry_detail.payment_id;
  this.is_deleted = entry_detail.is_deleted;
  this.created_at = entry_detail.created_at;
  this.updated_at = entry_detail.updated_at;
};

module.exports = EntryDetail;

const sql = require('../config/dbConfig');

const Product = function (product) {
  this.barcode = product.barcode;
  this.name = product.name;
  this.description = product.description;
  this.list_price = product.list_price;
  this.sale_price = product.sale_price;
  this.thumbnail = product.thumbnail;
  this.status_id = product.status_id;
  this.supplier_id = product.supplier_id;
  this.category_id = product.category_id;
  this.is_deleted = product.is_deleted;
  this.created_at = product.created_at;
  this.updated_at = product.updated_at;
};

module.exports = Product;

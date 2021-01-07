const sql = require('../config/dbConfig');

// contructor to sale object
const Sale = function (sale) {
  this.total_sale = sale.total_sale;
  this.status_id = sale.status_id;
  this.staff_id = sale.staff_id;
  this.is_deleted = sale.is_deleted;
  this.created_at = sale.created_at;
  this.updated_at = sale.updated_at;
};

/*
    Method to create new item executing the database query, the method has three parameters that will be received in the controller,
    the first two are newSale, newSaleDetail data to create new sale and the last is the callback, this callback has error and response parameters.

    Using transactions run the queries. If there are error on beginTransaction it send.
    If there are error in some query, it run the rollback to cancel and it send error.
    Into the last query run commit.

    Execute INSERT queries to sale and sale_detail tables and with a trigger in database update the stock.

    First insert data in sale table, iterate newSaleDetail object and create sale_detail object, and add sale_id
    to each element iterated and then iterate sale_detail object to execute insert query with each element to insert
    data in sale_detail table
*/
Sale.create = (newSale, newSaleDetail, result) => {
  sql.beginTransaction((transactionError) => {
    if (transactionError) result(null, { error: transactionError });

    // insert entry
    sql.query('INSERT IGNORE INTO sale SET ?', newSale, (errSale, resSale) => {
      if (errSale) {
        return sql.rollback(() => {
          result(null, { error: errSale });
        });
      }

      // Iterate newSaleDetail object and create sale_detail object, and add sale_id to each element iterated
      const sale_detail = newSaleDetail.map((sale_d) => {
        return {
          ...sale_d,
          sale_id: resSale.insertId,
        };
      });

      // Iterate sale_detail object to execute insert query with each element
      sale_detail.map((sale_d) => {
        sql.query(
          `INSERT INTO sale_detail SET ?`,
          sale_d,
          (errSaleDetail, resSaleDetail) => {
            if (errSaleDetail) {
              return sql.rollback(() => {
                result(null, { error: errSaleDetail });
              });
            }
          }
        );
      });

      sql.commit((commitError) => {
        commitError != null
          ? result(null, { commitError })
          : result(null, {
              id: resSale.insertId,
              ...newSale,
              sales: [...newSaleDetail],
            });
      });
    });
  });
};

module.exports = Sale;

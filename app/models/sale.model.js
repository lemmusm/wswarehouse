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
*/
Sale.create = (newSale, newSaleDetail, result) => {
  sql.beginTransaction((transactionError) => {
    if (transactionError) result(null, { error: transactionError });

    // insert entry
    sql.query('INSERT INTO sale SET ?', newSale, (errSale, resSale) => {
      if (errSale) {
        return sql.rollback(() => {
          result(null, { error: errSale });
        });
      }

      // create sale detail object
      const sale_detail = {
        ...newSaleDetail,
        sale_id: resSale.insertId,
      };

      // insert sale detail
      sql.query(
        `INSERT INTO sale_detail SET ?`,
        sale_detail,
        (errSaleDetail, resSaleDetail) => {
          if (errSaleDetail) {
            return sql.rollback(() => {
              result(null, { error: errSaleDetail });
            });
          }

          sql.commit((commitError) => {
            commitError != null
              ? result(null, { commitError })
              : result(null, {
                  message: 'sale created successful.',
                  data:
                    (null,
                    {
                      id: resSale.insertId,
                      ...newSale,
                      ...newSaleDetail,
                    }),
                });
          });
        }
      );
    });
  });
};

module.exports = Sale;

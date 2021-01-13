const { rollback } = require('../config/dbConfig');
const sql = require('../config/dbConfig');

// contructor to sale object
const Sale = function (sale) {
  this.total_sold = sale.total_sold;
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

    First a callback function is created that verified if there is available stock by iterating with for loop the data sent
    from the frontend, executing a SELECT query for each iteration, this query returns a result for each iteration,
    if the result of the request to the database is less than entered from the frontend, if there are results they are
    added to productsNotAvailable array, then waiting to finish the for loop to send productsNotAvailable array to the callback.

    When the callback function is executed, it returns the result, if the length of the result is greater than 0,
    that means there are products not available and send an error message, else run the INSERT queries .

    Execute INSERT queries to sale and sale_detail tables and with a trigger in database update the stock.

    First insert data in sale table, iterate newSaleDetail object and create sale_detail object, and add sale_id
    to each element iterated and then iterate sale_detail object to execute insert query with each element to insert
    data in sale_detail table
*/
Sale.create = (newSale, newSaleDetail, result) => {
  sql.beginTransaction((transactionError) => {
    if (transactionError) result(null, { error: transactionError });

    let productsNotAvailable = [];
    const checkStockAvailable = (callback) => {
      for (let i = 0; i < newSaleDetail.length; i++) {
        sql.query(
          `SELECT quantity, name
          FROM stock
          INNER JOIN product ON product.id_product =  stock.product_id WHERE product_id = ${newSaleDetail[i].product_id}`,
          (errStock, resStock) => {
            if (errStock) {
              return sql.rollback(() => {
                result(null, { error: errStock });
              });
            }

            // Create array with product not available
            for (let x = 0; x < resStock.length; x++) {
              if (resStock[x].quantity < newSaleDetail[i].quantity_sale) {
                productsNotAvailable.push(resStock[x].name);
              }
            }
            // Waiting to finish loop and send productsNotAvailable
            if (newSaleDetail.length - 1 === i) {
              callback(productsNotAvailable);
            }
          }
        );
      }
    };

    checkStockAvailable((res) => {
      res.length > 0
        ? result(null, `The following items are not available: ${res}`)
        : // insert entry
          sql.query(
            'INSERT IGNORE INTO sale SET ?',
            newSale,
            (errSale, resSale) => {
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
            }
          );
    });
  });
};

Sale.getById = (id, result) => {
  sql.beginTransaction((transactionError) => {
    if (transactionError) result(null, { error: transactionError });

    sql.query(
      `SELECT
        product.name, product.description, barcode,
        quantity_sale AS qty,
        price, tax, discount, amount, total,
        status,
        CONCAT(first_name, " ", last_name) AS staff,
        type AS payment_type,
        sale_detail.created_at AS sale_product_created,
        sale_detail.updated_at AS sale_product_updated
        FROM sale
        LEFT JOIN sale_detail ON sale_detail.sale_id = sale.id_sale
        LEFT JOIN product ON product.id_product = sale_detail.product_id
        INNER JOIN status ON status.id_status = sale.status_id
        INNER JOIN staff ON staff.id_staff = sale.staff_id
        LEFT JOIN payment ON payment.id_payment = sale_detail.payment_id
        WHERE id_sale = ${id}`,
      (err, res) => {
        if (err) {
          return sql.rollback(() => {
            result(null, { error: err });
          });
        }

        sql.query(
          `SELECT
            total_sold, sale.created_at, sale.updated_at
            FROM sale
            WHERE id_sale = ${id}`,
          (errDates, resDates) => {
            if (errDates) {
              return sql.rollback(() => {
                result(null, { error: errDates });
              });
            }

            sql.commit((commitError) => {
              if (commitError != null) result(null, { error: commitError });
              res.length > 0
                ? result(null, {
                    sale_id: id,
                    total_sold: resDates[0].total_sold,
                    created_at: resDates[0].created_at,
                    updated_at: resDates[0].updated_at,
                    sold_products: res,
                  })
                : result({ kind: 'not found' }, null);
            });
          }
        );
      }
    );
  });
};

module.exports = Sale;

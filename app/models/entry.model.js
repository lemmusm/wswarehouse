const sql = require('../config/dbConfig');

// contructor to entry object
const Entry = function (entry) {
  this.bill_number = entry.bill_number;
  this.total_entry = entry.total_entry;
  this.staff_id = entry.staff_id;
  this.status_id = entry.status_id;
  this.is_deleted = entry.is_deleted;
  this.created_at = entry.created_at;
  this.updated_at = entry.updated_at;
};

/*
    Method to create new item executing the database query, the method has four parameters that will be received in the controller,
    the first three are product, entry, entry_detail data to create new entry and the last is the callback, this callback has error and response parameters.

    Using transactions run the queries. If there are error on beginTransaction it send.
    If there are error in some query, it run the rollback to cancel and it send error.
    Into the last query run commit.

    First it execute a SELECT query, if there are barcode or name with duplicate values it send message,
    if not execute next queries to INSERT data for new entry.
*/

Entry.create = (product, entry, entry_detail, result) => {
  sql.beginTransaction((transactionError) => {
    if (transactionError) result(null, { error: transactionError });

    sql.query(
      `SELECT barcode, name FROM product WHERE barcode='${product.barcode}' OR name='${product.name}'`,
      (errSelect, resSelect) => {
        if (errSelect) {
          return sql.rollback(() => {
            result(null, { error: errSelect });
          });
        }

        if (resSelect.length > 0) {
          const barcode = resSelect.map((r) => r.barcode);
          const name = resSelect.map((r) => r.name);

          if (barcode[0] === product.barcode)
            return result(null, {
              code: '_004',
              message: 'Duplicated value in barcode.',
              description: 'Error in the database query with duplicated value.',
            });
          if (name[0] === product.name)
            return result(null, {
              code: '_004',
              message: 'Duplicated value in name.',
              description: 'Error in the database query with duplicated value.',
            });
        } else {
          sql.query(
            `INSERT IGNORE INTO product SET ?`,
            product,
            (errProd, resProd) => {
              if (errProd) {
                return sql.rollback(() => {
                  result(null, { error: errProd });
                });
              }
              // if there is affectedRows execute next queries, if not send warning message
              sql.query(
                `INSERT INTO entry SET ?`,
                entry,
                (errEntry, resEntry) => {
                  if (errEntry) {
                    return sql.rollback(() => {
                      result(null, { error: errEntry });
                    });
                  }
                  // create entry object with data receive from controller, product and entry id
                  const obj_entry_detail = {
                    ...entry_detail,
                    product_id: resProd.insertId,
                    entry_id: resEntry.insertId,
                  };
                  //  query to insert entry_detail
                  sql.query(
                    `INSERT INTO entry_detail SET ?`,
                    obj_entry_detail,
                    (errEntryDetails, resEntryDetails) => {
                      if (errEntryDetails) {
                        return sql.rollback(() => {
                          result(null, { error: errEntryDetails });
                        });
                      }
                      //  if all is ok, run the commit
                      sql.commit((commitError) => {
                        commitError != null
                          ? result(null, { error: commitError })
                          : result(null, {
                              data:
                                (null,
                                {
                                  id: resEntry.insertId,
                                  ...entry,
                                  ...obj_entry_detail,
                                  ...product,
                                }),
                            });
                      });
                    }
                  );
                }
              );
            }
          );
        }
      }
    );
  });
};

module.exports = Entry;

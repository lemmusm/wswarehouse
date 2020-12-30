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
*/

Entry.create = (product, entry, entry_detail, result) => {
  sql.beginTransaction((transactionError) => {
    if (transactionError) result(null, { error: transactionError });
  });

  //  query to insert product
  sql.query(`INSERT INTO product SET ?`, product, (errProd, resProd) => {
    if (errProd) {
      return sql.rollback(() => {
        result(null, { error: errProd });
      });
    }

    //  query to insert entry
    sql.query(`INSERT INTO entry SET ?`, entry, (errEntry, resEntry) => {
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
    });
  });
};

module.exports = Entry;

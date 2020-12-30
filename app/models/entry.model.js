const sql = require('../config/dbConfig');

const Entry = function (entry) {
  this.bill_number = entry.bill_number;
  this.total_entry = entry.total_entry;
  this.staff_id = entry.staff_id;
  this.status_id = entry.status_id;
  this.is_deleted = entry.is_deleted;
  this.created_at = entry.created_at;
  this.updated_at = entry.updated_at;
};

Entry.create = (product, entry, entry_detail, result) => {
  sql.beginTransaction((transactionError) => {
    if (transactionError) result(null, { error: transactionError });
  });

  sql.query(`INSERT INTO product SET ?`, product, (errProd, resProd) => {
    if (errProd) {
      return sql.rollback(() => {
        result(null, { error: errProd });
      });
    }

    // insert entry
    sql.query(`INSERT INTO entry SET ?`, entry, (errEntry, resEntry) => {
      if (errEntry) {
        return sql.rollback(() => {
          result(null, { error: errEntry });
        });
      }

      // create entry object to receive data from controller
      const obj_entry_detail = {
        ...entry_detail,
        product_id: resProd.insertId,
        entry_id: resEntry.insertId,
      };

      sql.query(
        `INSERT INTO entry_detail SET ?`,
        obj_entry_detail,
        (errEntryDetails, resEntryDetails) => {
          if (errEntryDetails) {
            return sql.rollback(() => {
              result(null, { error: errEntryDetails });
            });
          }

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

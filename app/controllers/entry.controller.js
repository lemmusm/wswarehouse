const Entry = require('../models/entry.model');
const EntryDetails = require('../models/entry_detail.model');
const Product = require('../models/product.model');
const LocalDateTime = require('../helpers/datetime');

/*
    Method to create new entry to warehouse, this method have two parameters request and result.
    Validate if request have content, if not it send status 400 and message.
    Get LocalDateTime helper to use on created_at and update_at.
    Entry_detail, entry and product objects are created with data from req.body and callback with error and data parameters,
    they are sent as arguments in the 'create' method to the model, if there is error it send status 500 with message,
    if there is a response, the data is sent.
*/
exports.createEntry = (req, res) => {
  //validate request
  if (!req.body) res.status(400).send({ message: 'Content can not be empty!' });

  const { datetime } = new LocalDateTime(new Date());

  // create entry_detail
  const entry_detail = new EntryDetails({
    quantity_entry: req.body.quantity_entry,
    tax: req.body.tax,
    price: req.body.price,
    amount: parseFloat(
      (req.body.tax * req.body.price) / 100 + req.body.price
    ).toFixed(2), // % x list_price / 100 + amount
    payment_id: req.body.payment_id,
    status_id: req.body.status_id,
    is_deleted: 0,
    created_at: datetime,
    updated_at: datetime,
  });

  // create entry
  const entry = new Entry({
    total_entry: (req.body.quantity_entry * entry_detail.amount).toFixed(2), // entry_detail(quantity * amount)
    staff_id: req.body.staff_id,
    status_id: 1,
    is_deleted: 0,
    created_at: datetime,
    updated_at: datetime,
  });

  const amount = parseFloat(entry_detail.amount);
  const sale_price = (15 * amount) / 100 + amount;
  // create product
  const product = new Product({
    barcode: req.body.barcode,
    name: req.body.name,
    description: req.body.description,
    list_price: parseFloat(entry_detail.amount).toFixed(2), // same price amount from entry_detail
    sale_price: sale_price.toFixed(2), // entry_detail.amount + 15%
    thumbnail: req.body.thumbnail,
    status_id: 1,
    supplier_id: req.body.supplier_id,
    category_id: req.body.category_id,
    is_deleted: 0,
    created_at: datetime,
    updated_at: datetime,
  });

  Entry.create(product, entry, entry_detail, (err, data) => {
    if (err) {
      err.status(500).send({
        code: '_001',
        message: err.message || 'Some error ocurred while retrieving data.',
        description: 'Error in the database query',
      });
    } else {
      res.send({
        data,
      });
    }
  });
};

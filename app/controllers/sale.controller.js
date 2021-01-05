const Sale = require('../models/sale.model');
const SaleDetail = require('../models/sale_detail.model');
const LocalDateTime = require('../helpers/datetime');

/*
    Method to create new sale, this method have two parameters request and result.
    Validate if request have content, if not it send status 400 and message.
    Get LocalDateTime helper to use on created_at and update_at.
    sale_detail and sale objects are created with data from req.body.
    Call the create method from the model and send the sale, sale_detail, and a callback as arguments.
*/
exports.createSale = (req, res) => {
  // validate request
  if (!req.body) res.status(400).send({ message: 'Content can not be empty!' });

  const { datetime } = new LocalDateTime(new Date());

  // create sale_detail
  const sale_detail = new SaleDetail({
    quantity_sale: req.body.quantity_sale,
    price: req.body.price,
    tax: req.body.tax,
    discount: req.body.discount,
    amount: parseFloat(
      (req.body.tax * req.body.price) / 100 + req.body.price
    ).toFixed(2),
    product_id: req.body.product_id,
    payment_id: req.body.payment_id,
    is_deleted: 0,
    created_at: datetime,
    updated_at: datetime,
  });

  // create sale
  const sale = new Sale({
    total_sale: (sale_detail.quantity_sale * sale_detail.amount).toFixed(2),
    status_id: req.body.status_id,
    staff_id: req.body.staff_id,
    is_deleted: 0,
    created_at: datetime,
    updated_at: datetime,
  });

  Sale.create(sale, sale_detail, (err, data) => {
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

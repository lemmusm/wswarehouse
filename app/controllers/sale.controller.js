const Sale = require('../models/sale.model');
const SaleDetail = require('../models/sale_detail.model');
const LocalDateTime = require('../helpers/datetime');

/*

    Method to create new sale, this method have two parameters request and result.
    Validate if request have content, if not it send status 400 and message.
    Get LocalDateTime helper to use on created_at and update_at.
    With the map method, the data in sale_detail is iterated from req.body and these values ​​are return to be sent to the model and the query executed.
    sale_detail and sale objects are created with data from req.body.
    Call the create method from the model and send the sale, sale_detail, and a callback as arguments.
*/
exports.createSale = (req, res) => {
  // validate request
  if (!req.body) res.status(400).send({ message: 'Content can not be empty!' });

  const { datetime } = new LocalDateTime(new Date());

  // create array with sale_detail from req body
  const sale_detail = req.body.sale_detail.map((rbody) => {
    return (sales = new SaleDetail({
      quantity_sale: rbody.quantity_sale,
      price: rbody.price,
      tax: rbody.tax,
      discount: rbody.discount,
      amount: parseFloat((rbody.tax * rbody.price) / 100 + rbody.price).toFixed(
        2
      ),
      product_id: rbody.product_id,
      payment_id: rbody.payment_id,
      is_deleted: 0,
      created_at: datetime,
      updated_at: datetime,
    }));
  });

  // The total is obtained according to the quantity and amount
  const total_sale_individual = sale_detail.map((sale) => {
    return sale.quantity_sale * sale.amount;
  });

  // The totals obtained are added
  const grand_total = total_sale_individual.reduce((a, b) => a + b, 0);

  // create sale
  const sale = new Sale({
    total_sale: grand_total.toFixed(2),
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
      res.status(200).send({
        message: 'sale created successful.',
        data,
      });
    }
  });
};

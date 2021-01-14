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
      total: (
        ((rbody.tax * rbody.price) / 100 + rbody.price) *
        rbody.quantity_sale
      ).toFixed(2),
      product_id: rbody.product_id,
      payment_id: rbody.payment_id,
      is_deleted: 0,
      created_at: datetime,
      updated_at: datetime,
    }));
  });

  // The total is obtained according to the quantity and amount
  const total_sale_individual = sale_detail.map((sale) => {
    return sale.total;
  });

  // The totals obtained are added
  let grand_total = 0;

  total_sale_individual.forEach((total) => {
    return (grand_total += parseFloat(total));
  });

  // create sale
  const sale = new Sale({
    total_sold: grand_total.toFixed(2),
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
      res.status(200).send(data);
    }
  });
};

/*
    Method to get a sale by id, this method have two parameters request and result.
    If there is an error of type 'not found', it sends the 404 status with the error message;
    otherwise the error comes from the database and it send status 500 with the error message.
    If there are response successful it send status 200 with data.
*/
exports.getSaleById = (req, res) => {
  const id = req.params.id;

  Sale.getById(id, (err, data) => {
    if (err) {
      if (err.kind === 'not found') {
        res.status(404).send({
          code: '_002',
          message: `Not matches found with the id: ${id}.`,
          description: 'Data not found in database',
        });
      } else {
        res.status(500).send({
          code: '_001',
          message: `Error retrieving item with id : ${id}.`,
          description: 'Error in the database query',
          error: err,
        });
      }
    } else {
      res.status(200).send({
        message: 'Sale found.',
        data,
      });
    }
  });
};

/*
    Method to get all sales with sold products, this method have two parameters request and result.
    Send to model queryOptions to manage pagination.
    If there is an error from the database it send status 500 with the error message otherwise
    are response successful it send status 200 with data.
*/
exports.getAllSales = (req, res) => {
  // pagination options
  const limit = req.body.limit;
  const page = req.query.page;
  const offset = (page - 1) * limit;

  const queryOptions = {
    limit,
    page,
    offset,
  };

  Sale.getAll(queryOptions, (err, data) => {
    if (err) {
      res.status(500).send({
        code: '_001',
        message: err.message || 'Some error ocurred while retrieving data.',
        description: 'Error in the database query',
      });
    } else {
      res.status(200).send(data);
    }
  });
};

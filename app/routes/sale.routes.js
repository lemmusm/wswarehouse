module.exports = (app) => {
  const sale = require('../controllers/sale.controller');
  const router = require('express').Router();

  app.use('/api/v1/sale', router);

  // Create new sale
  router.post('/', sale.createSale);

  // Get all sales with sold products
  router.get('/', sale.getAllSales);

  // Get one sale by id
  router.get('/:id', sale.getSaleById);
};

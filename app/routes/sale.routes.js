module.exports = (app) => {
  const sale = require('../controllers/sale.controller');
  const router = require('express').Router();

  // Create new sale
  router.post('/', sale.createSale);

  //Get one sale by id
  router.get('/:id', sale.getSaleById);

  app.use('/api/v1/sale', router);
};

module.exports = (app) => {
  const sale = require('../controllers/sale.controller');
  const router = require('express').Router();

  // Create new entry
  router.post('/', sale.createSale);

  app.use('/api/v1/sale', router);
};

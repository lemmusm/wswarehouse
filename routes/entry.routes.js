module.exports = (app) => {
  const entry = require('../controllers/entry.controller');
  const router = require('express').Router();

  // Create new entry
  router.post('/', entry.createEntry);

  app.use('/api/v1/entry', router);
};

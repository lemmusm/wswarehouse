const express = require('express');

const Router = express.Router();

Router.get('/', (req, res) => {
  res.json({ message: 'Welcome to REST API application.' });
});

module.exports = Router;

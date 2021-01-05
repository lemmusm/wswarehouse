const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

require('dotenv').config();

const app = express();
const port = process.env.PORT || process.env.SERVER_PORT;

// parse request of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - applications/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// use cors
app.use(cors({ origin: true, credentials: true }));

// simple route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to REST API application.' });
});

//routes
require('./app/routes/entry.routes')(app);
require('./app/routes/sale.routes')(app);

// set port, listen for request
app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});

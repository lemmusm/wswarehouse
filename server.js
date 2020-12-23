const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const router = require('./routes/router');

require('dotenv').config();

const app = express();
const port = process.env.PORT || process.env.SERVER_PORT;

// parse request of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - applications/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// use cors
app.use(cors({ origin: true, credentials: true }));

// router
app.use('/api/v1/', router);

// set port, listen for request
app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});

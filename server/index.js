const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const channels = require('./controllers/channels');
const { search } = require('./controllers/search');
const users = require('./controllers/users');


express()
  .use(morgan('combined'))
  .use(bodyParser.json())
  .use(cors())

  .get('/users', users.list)
  .get('/users/:id', users.get)

  .get('/channels', channels.list)
  .get('/channels/:channel', channels.get)

  .get('/search/:term', search)

  .listen(5000);
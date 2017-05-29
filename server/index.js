const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const webpack = require('webpack');
const webpackConfig = require('./webpack.config');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

const compiler = webpack(webpackConfig);

const channels   = require('./controllers/channels');
const { search } = require('./controllers/search');
const users      = require('./controllers/users');


express()
  .use(webpackDevMiddleware(compiler, {noInfo: true, publicPath: webpackConfig.output.publicPath}))
  .use(webpackHotMiddleware(compiler))
  .use(morgan('combined'))
  .use(express.static('./client'))
  .use(bodyParser.json())

  .get('/users', users.list)
  .get('/users/:id', users.get)

  .get('/channels', channels.list)
  .get('/channels/:channel', channels.get)

  .get('/search/:term', search)

  .listen(5000);
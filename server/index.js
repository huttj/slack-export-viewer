const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const slackToEmoji = require('./slackToEmoji');

const webpack = require('webpack');
const webpackConfig = require('./webpack.config');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

const compiler = webpack(webpackConfig);

express()
  .use(webpackDevMiddleware(compiler, {noInfo: true, publicPath: webpackConfig.output.publicPath}))
  .use(webpackHotMiddleware(compiler))
  .use(morgan('combined'))
  .use(express.static('./client'))
  .use(bodyParser.json())
  .get('/users', catcher(listUsers))
  .get('/users/:id', catcher(getUser))
  .get('/channels', catcher(listChannels))
  .get('/channels/:channel', catcher(getChannel))
  .get('/search/:term', catcher(search))
  .listen(5000);


const BACKUP_PATH = path.resolve(__dirname + '/../slack_backup');


function catcher(handler) {
  return (req, res, next) => {
    try {
      const promise = handler(req, res, next);
      if (promise && promise.catch) promise.catch(error => next(error.stack));
    } catch (error) {
      next(error.stack);
    }
  }
}

async function listUsers(req, res, next) {
  const users = require(BACKUP_PATH + '/users.json');

  if (req.query.count) {

    const usersById = users.reduce((acc, user) => {
      acc[user.id] = user;
      user.count = 0;
      return acc;
    }, {});

    const channels = require(BACKUP_PATH + '/channels.json');

    await Promise.all(channels.map(async channel => {
      const messages = await getMessages(channel.name);

      for (const message of messages) {
        try {
          usersById[message.user].count++;
        } catch (e) {
          console.log(message.user);
        }
      }
    }));
  }

  res.send(users);
}

async function listChannels(req, res, next) {

  const channels = require(BACKUP_PATH + '/channels.json');

  if (req.query.count) {
    await Promise.all(channels.map(async channel => {
      const messages = await getMessages(channel.name);
      channel.count = messages.length;
    }));
  }

  res.send(channels);

}

async function getMessages(channel) {
  const channelPath = BACKUP_PATH + '/' + channel;

  const files = await readDir(channelPath);

  const contents = await Promise.all(files.map(file => require(channelPath + '/' + file)));

  return [].concat(...contents);
}

async function getChannel(req, res, next) {

  const channelPath = BACKUP_PATH + '/' + req.params.channel;

  const files = await readDir(channelPath);

  const contents = await Promise.all(files.map(file => {

    const messages = require(channelPath + '/' + file);
    messages.forEach(m => m.text = slackToEmoji(m.text));
    return messages;

  }));

  res.send([].concat(...contents));

}

async function search(req, res, next) {
  const channels = require(BACKUP_PATH + '/channels.json');

  const {term} = req.params;
  const re = new RegExp(term);

  const results = [];

  for (const channel of channels) {
    const messages = await getMessages(channel.name);

    const filtered = messages.filter(message => {
      const isMatch = message.text.match(re);
      if (isMatch) message.text = slackToEmoji(message.text);
      return isMatch;
    });

    if (filtered.length) {
      results.push({ channel: channel.name, messages: filtered.sort((a,b) => a.ts - b.ts) });
    }
    // if (results.length > 50) break;
  }

  res.send(results);
}

async function getUser(req, res, next) {
  const channels = require(BACKUP_PATH + '/channels.json');

  const {id} = req.params;

  const results = [];

  for (const channel of channels) {
    const messages = await getMessages(channel.name);

    const filtered = messages.filter(message => {
      message.channel = channel.name;

      const isMatch = message.user === id;

      if (isMatch) message.text = slackToEmoji(message.text);
      return isMatch;
    });

    if (filtered.length) {
      results.push(...filtered);
    }
    // if (results.length > 50) break;
  }

  res.send(results.sort((a,b) => a.ts - b.ts));
}

async function isFolder(...path) {
  return (await fs.lstat(path.join('/'))).isDirectory();
}

function readDir(dirPath) {
  return np(cb => fs.readdir(path.resolve(dirPath), cb)).catch(e => console.log('ERROR:', e));
}

function np(fn) {
  return new Promise((resolve, reject) => {
    fn((err, res) => err ? reject(err) : resolve(res));
  });
}
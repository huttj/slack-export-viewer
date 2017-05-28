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
const PAGE_SIZE = 50;
const HALF_PAGE_SIZE = 25;

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
        } catch (e) {}
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

  const { channel } = req.params;
  const { page=1, user, ts } = req.query;

  const start = (page - 1) * PAGE_SIZE;
  const end   = start + PAGE_SIZE;

  let messages = [];

  const channelMessages = await getMessages(channel);

  if (user && ts) {

    const i = channelMessages.findIndex(m => m.ts === ts && m.user === user);

    const topOff = Math.ceil((i + 1) / PAGE_SIZE) * PAGE_SIZE;

    if (i > -1) messages = channelMessages.slice(Math.max(0, topOff - PAGE_SIZE), topOff);

  } else {
    messages = channelMessages.slice(start, end);
  }

  messages.forEach(m => m.text = slackToEmoji(m.text));

  res.send(messages);

}

async function search(req, res, next) {
  const channels = require(BACKUP_PATH + '/channels.json');

  const {term} = req.params;
  const {channel} = req.query;

  const re = new RegExp(term,'i');

  const start = 0;
  const end   = (start + PAGE_SIZE / 10) | 0;

  const results = [];

  if (channel) {

    const channelMessages = await getMessages(channel);

    const filtered = channelMessages.filter(message => {
      const isMatch = message.text.match(re);
      if (isMatch) message.text = slackToEmoji(message.text);
      return isMatch;
    });

    if (filtered.length) {
      const messages = filtered.sort((a,b) => a.ts - b.ts);
      results.push({ channel, messages, count: filtered.length });
    }

  } else {

    for (const channel of channels) {
      const channelMessages = await getMessages(channel.name);

      const filtered = channelMessages.filter(message => {
        const isMatch = message.text.match(re);
        if (isMatch) message.text = slackToEmoji(message.text);
        return isMatch;
      });


      if (filtered.length) {
        const messages = filtered.sort((a,b) => a.ts - b.ts).slice(start, end);
        console.log(start, end, messages.length, filtered.length, channel.name);
        results.push({ channel: channel.name, messages, count: filtered.length });
      }
    }
  }

  res.send(results);
}

async function getUser(req, res, next) {
  const channels = require(BACKUP_PATH + '/channels.json');

  const {id} = req.params;
  const { page=1 } = req.query;

  const start = ((page - 1) * PAGE_SIZE / 10) | 0;
  const end   = (start + PAGE_SIZE / 10) | 0;

  const results = [];

  for (const channel of channels) {
    const messages = await getMessages(channel.name);

    const filtered = messages.filter(message => {
      message.channel = channel.name;

      const isMatch = message.user === id;

      if (isMatch) message.text = slackToEmoji(message.text);
      return isMatch;

    }).slice(start, end);

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
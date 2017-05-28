const slackToEmoji = require('../util/slackToEmoji');
const np = require('../util/nodePromise');
const readDir = require('../util/readDir');
const getMessages = require('../util/getMessages');
const getUserMessages = require('../util/getUserMessages');
const catcher = require('../util/catcher');

const { BACKUP_PATH, PAGE_SIZE, HALF_PAGE_SIZE } = require('../constants');


exports.list = catcher(async function listUsers(req, res) {
  const users = require(BACKUP_PATH + '/users.json');

  if (req.query.count) {

    const usersById = users.reduce((acc, user) => {
      acc[user.id] = user;
      user.count = 0;
      user.first = { user: user.id, ts: Infinity };
      user.last = { user: user.id, ts: -Infinity };
      return acc;
    }, {});

    const channels = require(BACKUP_PATH + '/channels.json');

    await Promise.all(channels.map(async channel => {
      const messages = await getMessages(channel.name);

      for (const message of messages) {
        try {
          const user = usersById[message.user];
          user.first.ts = Math.min(message.ts, user.first.ts);
          user.last.ts = Math.max(message.ts, user.last.ts);
          user.count++;
        } catch (e) {}
      }
    }));
  }

  res.send(users);
});

exports.get = catcher(async function getUser(req, res, next) {
  const channels = require(BACKUP_PATH + '/channels.json');

  const {id} = req.params;
  const { user, ts, after, before } = req.query;

  const userMessages = await getUserMessages(id);

  let results;

  if (user && ts) {

    const i = userMessages.findIndex(m => m.ts === ts && (user === 'undefined' || m.user === user));

    const adjustedAfter  = after ? i + 1 + PAGE_SIZE : i + 1;
    const adjustedBefore = before ? Math.max(0, i - PAGE_SIZE) : i;

    if (i > -1) results = userMessages.slice(adjustedBefore, adjustedAfter);

  } else {
    results = userMessages.slice(-PAGE_SIZE);
  }

  res.send( results.sort((a,b) => a.ts - b.ts) );
});
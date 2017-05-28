const slackToEmoji = require('../util/slackToEmoji');
const np = require('../util/nodePromise');
const readDir = require('../util/readDir');
const getMessages = require('../util/getMessages');
const catcher = require('../util/catcher');

const { BACKUP_PATH, PAGE_SIZE, HALF_PAGE_SIZE } = require('../constants');


exports.list = catcher(async function listChannels(req, res, next) {

  const channels = require(BACKUP_PATH + '/channels.json');

  if (req.query.count) {
    await Promise.all(channels.map(async channel => {
      const messages = (await getMessages(channel.name)).sort((a,b) => a.ts - b.ts);
      channel.count = messages.length;
      channel.first = messages[0];
      channel.last = messages[messages.length - 1];
    }));
  }

  res.send(channels);
});

exports.get = catcher(async function getChannel(req, res, next) {

  const { channel } = req.params;
  const { page=1, user, ts, after, before } = req.query;

  let messages = [];

  const channelMessages = await getMessages(channel);

  let selectedMessage = null;

  if (user && ts) {


    const i = channelMessages.findIndex(m => m.ts === ts && (user === 'undefined' || m.user === user));

    selectedMessage = channelMessages[i];

    const adjustedAfter  = after ? i + 1 + PAGE_SIZE : i + 1;
    const adjustedBefore = before ? Math.max(0, i - PAGE_SIZE) : i;

    if (i > -1) messages = channelMessages.slice(adjustedBefore, adjustedAfter);

  } else {
    messages = channelMessages.slice(-PAGE_SIZE);
  }

  messages.forEach(m => m.text = slackToEmoji(m.text));

  res.send({ selectedMessage, messages });

});
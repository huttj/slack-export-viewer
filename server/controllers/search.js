const slackToEmoji = require('../util/slackToEmoji');
const readDir = require('../util/readDir');
const getMessages = require('../util/getMessages');
const catcher = require('../util/catcher');

const { BACKUP_PATH, PAGE_SIZE, HALF_PAGE_SIZE } = require('../constants');


exports.search = catcher(async function search(req, res, next) {
  const channels = require(BACKUP_PATH + '/channels.json');

  const {term} = req.params;
  const {channel} = req.query;

  const re = new RegExp(term,'i');

  const end = (PAGE_SIZE / 10) | 0;

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
        const messages = filtered.sort((a,b) => a.ts - b.ts).slice(-end);
        results.push({ type: 'search', channel: channel.name, messages, count: filtered.length });
      }
    }
  }

  res.send(results);
});
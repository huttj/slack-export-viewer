const { BACKUP_PATH } = require('../constants');
const getMessages = require('./getMessages');
const slackToEmoji = require('./slackToEmoji');

module.exports = async function getUserMessages(id) {

  const channels = require(BACKUP_PATH + '/channels.json');

  const userMessages = [];

  await Promise.all(channels.map(async channel => {

    const messages = await getMessages(channel.name);

    userMessages.push(...messages.filter(m => {
      const isMatch = m.user === id;
      m.channel = channel.name;
      if (isMatch) m.text = slackToEmoji(m.text);
      return isMatch;
    }));

  }));

  return userMessages.sort((a,b) => a.ts - b.ts);

};
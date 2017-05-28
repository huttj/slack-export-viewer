const { BACKUP_PATH } = require('../constants');
const readDir = require('./readDir');

module.exports = async function getMessages(channel) {

  const channelPath = BACKUP_PATH + '/' + channel;

  const files = await readDir(channelPath);

  const contents = await Promise.all(files.map(file => require(channelPath + '/' + file)));

  return [].concat(...contents);
};
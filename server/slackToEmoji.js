const punycode = require('punycode');
const emoji_data = require('./emoji.json');


module.exports = function slackToUnicode(text) {

  let emoji_re = /\:([a-zA-Z0-9\-_\+]+)\:(?:\:([a-zA-Z0-9\-_\+]+)\:)?/g;

  let replaced = text;

  let match;

  // Find all Slack emoji in the message
  while(match = emoji_re.exec(text)) {

    const ed = emoji_data.find(el => el.short_names.indexOf(match[1]) > -1);

    if (ed) {
      let points = ed.unified.split("-");
      points = points.map(function(p){ return parseInt(p, 16) });
      replaced = replaced.replace(match[0], punycode.ucs2.encode(points));
    }
  }

  return replaced;
};
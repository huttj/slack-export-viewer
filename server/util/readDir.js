const fs = require('fs');
const path = require('path');
const np = require('./nodePromise');

module.exports = function readDir(dirPath) {
  return np(cb => fs.readdir(path.resolve(dirPath), cb)).catch(e => console.error('ERROR:', e));
};

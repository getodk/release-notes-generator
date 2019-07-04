const authors = require('./authors');
const promisify = require('util').promisify;
const readFile = promisify(require("fs").readFile);

module.exports = async path => authors.feedAuthors(JSON.parse((await readFile(path)).toString("utf8")));
;

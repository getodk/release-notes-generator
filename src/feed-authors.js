#!/usr/bin/env node

const authors = require('./authors');
const promisify = require('util').promisify;
const readFile = promisify(require("fs").readFile);

const run = async path => {
  const json = await readFile(path);
  authors.feedAuthors(JSON.parse(json.toString("utf8")));
};

run(process.argv[2]).catch(error => console.error(error));

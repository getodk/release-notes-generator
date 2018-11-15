#!/usr/bin/env node

const generate = require('./generate');
const feedAuthors = require('./feed-authors');
const printAuthors = require('./print-authors');

const run = async ([__, ___, command, ...args]) => {
  if (command === 'generate')
    return generate(`${args[1]}..${args[2]}`, args[0])
  if (command === 'feed-authors')
    return feedAuthors(args[0]);
  if (command === 'print-authors')
    return printAuthors();
  throw new Error("You must specify a command: generate | feed-authors | print-authors")
};

run(process.argv).catch(error => console.error(error));


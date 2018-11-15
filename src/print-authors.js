#!/usr/bin/env node

const authors = require('./authors');

const run = async () => {
  authors.print();
};

run().catch(error => console.error(error));

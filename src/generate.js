#!/usr/bin/env node

const ejs = require('ejs');

const authors = require('./authors');

const join = require("./util").join;
const sort = require("./util").sort;
const parseDate = require("./util").parseDate;
const filter = require("./util").filter;
const readTpl = require("./util").readTpl;
const map = require("./util").map;
const getCommits = require("./util").getCommits;
const parsePR = require("./util").parsePR;
const parseUsername = require("./util").parseUsername;

const mergeCommitMapper = commit => {
  const username = parseUsername(commit.title);
  const pr = parsePR(commit.title);
  commit['ts'] = parseDate(commit.committerDate);
  commit['authorUsername'] = username;
  commit['realAuthorName'] = authors.nameByUsername(username);
  commit['pr'] = pr;
  return commit;
};

const squashMergeFilter = commit => commit.committerName !== 'GitHub' && commit.committerName !== commit.authorName;
const squashMergeMapper = commit => {
  commit['ts'] = parseDate(commit.committerDate);
  commit['authorUsername'] = authors.usernameByEmail(commit.authorEmail, commit.authorName);
  return commit;
};

const zipEverything = ([mergeCommits, squashMerges, mergeCommitTpl, squashMergeTpl]) => {
  tuples = [];
  mergeCommits.forEach(commit => {
    tuples.push([commit.ts, commit, mergeCommitTpl]);
  });
  squashMerges.forEach(commit => {
    tuples.push([commit.ts, commit, squashMergeTpl]);
  });
  return tuples;
};

Promise
    .all([
      getCommits(process.argv[2], `${process.argv[3]}..${process.argv[4]}`, true)
          .then(map(mergeCommitMapper)),
      getCommits(process.argv[2], `${process.argv[3]}..${process.argv[4]}`, false)
          .then(filter(squashMergeFilter))
          .then(map(squashMergeMapper)),
      readTpl('merge-commits'),
      readTpl('squash-merges')
    ])
    .then(zipEverything)
    .then(sort((a, b) => a[0] < b[1] ? -1 : a[0] > b[0] ? 1 : 0))
    .then(map(tuple => ejs.render(tuple[2], {commits: [tuple[1]]})))
    .then(join("\n"))
    .then(output => console.log(output))
    .catch(e => console.error(e));
const {DateTime} = require('luxon');
const shell = require('./shell');
const arrays = require('./arrays');
const objs = require('./objs');
const {map, filter} = require('./arrays');
const authors = require('./authors');

const normalize = message => message
    .replace(/\r\n?|[\n\u2028\u2029]/g, "\n")
    .replace(/^\uFEFF/, '')
    .trim();

const newCommitMark = "___";

const logFormat = [
  newCommitMark,
  "sha1:%H",
  "authorName:%an",
  "authorEmail:%ae",
  "authorDate:%aI",
  "committerName:%cn",
  "committerEmail:%ce",
  "committerDate:%cI",
  "title:%s",
  "%w(80,1,1)%b"
].join("%n");


const asEntry = lines => {
  const entry = {
    messageLines: []
  };
  lines.forEach(line => {
    if (line.type === "message")
      entry.messageLines.push(line.message);
    else if (line.type !== "new")
      entry[line.type] = line.message
  });
  return entry;
};

let entrySeq = -1;
const parseLine = line => {
  if (line === newCommitMark)
    return {entry: ++entrySeq, type: "new"};

  const match = line.match(/^([a-zA-Z]+1?)\s?:\s?(.*)$/i);
  return match
      ? {entry: entrySeq, type: match[1], message: match[2].trim()}
      : {entry: entrySeq, type: "message", message: line.trim()};
};

const parse = regexp => text => regexp.exec(text)[1];

const log = async (range, cwd, mergesOnly) => {
  const {stdout} = await shell.exec(`git log --no-color ${mergesOnly ? "--merges" : "--no-merges"} --branches=master --format="${logFormat}" ${range}`, {cwd});

  return Object.values(arrays.groupBy(
      objs.get("entry"),
      normalize(stdout).split("\n").map(line => parseLine(line))
  )).map(asEntry);
};

const parsePR = parse(/Merge pull request #(\d+)/);

const mergeCommitFilter = commit => /Merge pull request #(\d+)/.test(commit.title);
const mergeCommitMapper = commit => {
  const pr = parsePR(commit.title);
  commit['ts'] = DateTime.fromISO(commit.committerDate);
  commit['author'] = authors.feedCommit(commit, false);
  commit['pr'] = pr;
  return commit;
};

const squashMergeFilter = commit => commit.committerEmail !== commit.authorEmail;
const squashMergeMapper = commit => {
  commit['ts'] = DateTime.fromISO(commit.committerDate);
  commit['author'] = authors.feedCommit(commit, true);
  return commit;
};

exports.getMergeCommits = (range, cwd) => log(range, cwd, true)
    .then(filter(mergeCommitFilter))
    .then(map(mergeCommitMapper));

exports.getSquashMerges = (range, cwd) => log(range, cwd, false)
    .then(filter(squashMergeFilter))
    .then(map(squashMergeMapper));



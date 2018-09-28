const path = require('path');
const util = require('util');
const git = require("git-release-notes/lib/git");
const readFile = util.promisify(require('fs').readFile);
const dateFnsParse = require('date-fns/parse');
const month = name => {
  switch (name) {
    case "Jan":
      return '01';
    case "Feb":
      return '02';
    case "Mar":
      return '03';
    case "Apr":
      return '04';
    case "May":
      return '05';
    case "Jun":
      return '06';
    case "Jul":
      return '07';
    case "Aug":
      return '08';
    case "Sep":
      return '09';
    case "Oct":
      return '10';
    case "Nov":
      return '11';
    case "Dec":
      return '12';
  }
};
const pad = (number, places) => {
  let s = number + "";
  while (s.length < places) s = "0" + s;
  return s;
};
const dateRegexp = /^.+?, (\d+?) (\w+?) (\d+?) (\d+?):(\d+?):(\d+?) (.+?)$/;
const parseDate = text => {
  const matches = dateRegexp.exec(text);
  return dateFnsParse(`${matches[3]}-${month(matches[2])}-${pad(matches[1], 2)}T${pad(matches[4], 2)}:${pad(matches[5], 2)}:${pad(matches[6], 2)}.000${matches[7]}`);
};

const parse = regexp => text => regexp.exec(text)[1];

const parseUsername = parse(/ from (.+?)\//);
const parsePR = parse(/Merge pull request #(\d+)/);
const map = fn => array => array.map(fn);
const filter = fn => array => array.filter(fn);
const sort = fn => array => array.sort(fn);
const join = link => array => array.join(link);
const readTpl = tplName => readFile(path.resolve(__dirname, `templates/${tplName}.ejs`)).then(c => c.toString("utf8"));

const getCommits = (path, range, mergeCommits) => git.log({
  branch: 'master',
  range,
  title: "(.*)",
  meaning: 'type',
  cwd: path,
  mergeCommits,
  additionalOptions: []
});

module.exports = ({parseUsername, parsePR, map, filter, readTpl, getCommits, parseDate, sort, join});
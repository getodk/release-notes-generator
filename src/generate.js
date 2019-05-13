#!/usr/bin/env node

const ejs = require('ejs');
const git = require("./git");
const tpls = require("./tpls");
const comparingBy = require("./objs").comparingBy;

module.exports = async (range, cwd) => {
  const mergeCommits = await git.getMergeCommits(range, cwd);
  const mergeCommitTpl = await tpls.read('merge-commits');

  const squashMerges = await git.getSquashMerges(range, cwd);
  const squashMergeTpl = await tpls.read('squash-merges');

  // Pair commits up with their corresponding tpl
  const pairs = [];
  mergeCommits.forEach(commit => pairs.push([commit, mergeCommitTpl]));
  squashMerges.forEach(commit => pairs.push([commit, squashMergeTpl]));

  const output = pairs
      .sort(comparingBy(([commit]) => commit.ts.toMillis())) // Sort commits by commit date
      .map(([commit, tpl]) => ejs.render(tpl, {commits: [commit]})) // Render each commit individually
      .join("\n"); // Join all into the output text

  console.log(output);
};

const Preferences = require('preferences');
const sha1 = require('sha1');
const Author = require('./author');
const Option = require('./option');
const authors = new Preferences('org.opendatakit.release-notes-generator.authors', {}, {
  encrypt: false,
  format: 'json'
});

const parse = regexp => text => Option.of(regexp.exec(text)).map(matches => matches[1]);

const parseClassicMergeCommitUsername = parse(/ from (.+?)\//);

const searchAuthor = (authors, {uuid, username, emailHash, email, name}) => {
  if (uuid !== undefined && authors[uuid] !== undefined)
    return authors[uuid];

  emailHash = Option.race(Option.of(emailHash), Option.of(email).map(sha1)).orUndefined();
  for (let author of valuesOf(authors)) {
    if ((author.username !== undefined && author.username === username) ||
      (author.emailHash !== undefined && author.emailHash === emailHash) ||
      (author.name !== undefined && author.name === name))
      return Option.of(author).map(Author.fromJson);
  }
  return Option.empty();
};

const valuesOf = obj => Object.values(obj);

const feedAuthors = json => {
  json
    .map(Author.fromJson)
    .map(incomingAuthor => searchAuthor(authors, incomingAuthor).orElse(Author.empty()).merge(incomingAuthor))
    .forEach(author => authors[author.uuid] = author);
  console.log(authors);
};

const buildSquashMergeAuthorJson = (prefix, commit) => ({
  name: commit[`${prefix}Name`],
  email: commit[`${prefix}Email`].endsWith('users.noreply.github.com') ? undefined : commit[`${prefix}Email`],
  username: commit[`${prefix}Email`].endsWith('users.noreply.github.com') ? commit[`${prefix}Email`].substring(0, commit[`${prefix}Email`].indexOf("@")) : undefined
});

const buildMergeCommitAuthorJson = commit => parseClassicMergeCommitUsername(commit.title)
  .map(username => ({username}))
  .orElseGet(() => buildSquashMergeAuthorJson("author", commit));

const feedCommit = (commit, squash) => {
  if (squash) {
    // This is a "squash merge" type
    // We can get info from two authors for the same price
    const incomingAuthor = Author.fromJson(buildSquashMergeAuthorJson("author", commit));
    const author = searchAuthor(authors, incomingAuthor).orElse(Author.empty()).merge(incomingAuthor);
    authors[author.uuid] = author;
    const incomingCommitter = Author.fromJson(buildSquashMergeAuthorJson("committer", commit));
    const committer = searchAuthor(authors, incomingCommitter).orElse(Author.empty()).merge(incomingCommitter);
    authors[committer.uuid] = committer;
    return author;
  }
  // This is a "merge commit" type. The author is the guy who merged the PR, not the real author
  const incomingAuthor = Author.fromJson(buildMergeCommitAuthorJson(commit));
  const author = searchAuthor(authors, incomingAuthor).orElse(Author.empty()).merge(incomingAuthor);
  authors[author.uuid] = author;
  return author;
};

const print = () => console.log(JSON.stringify(Object.values(authors), null, 2));

exports.feedAuthors = feedAuthors;
exports.feedCommit = feedCommit;
exports.print = print;

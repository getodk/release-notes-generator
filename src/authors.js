const Preferences = require('preferences');
const uuidv4 = require('uuid').v4;
const Option = require('./option');
const namesByUsername = new Preferences('org.opendatakit.release-notes-generator.names-by-username', {}, {
  encrypt: false,
  format: 'json'
});
const usernamesByEmail = new Preferences('org.opendatakit.release-notes-generator.usernames-by-email', {}, {
  encrypt: false,
  format: 'json'
});
const authors = new Preferences('org.opendatakit.release-notes-generator.authors', {}, {
  encrypt: false,
  format: 'json'
});

class Author {
  constructor(uuid, name, email, username, organization) {
    this.uuid = uuid;
    this.name = name;
    this.email = email;
    this.username = username;
    this.organization = organization;
  }

  static fromJson({uuid, name, email, username, organization}) {
    return new Author(uuid || uuidv4(), name, email, username, organization);
  }

  static empty() {
    return new Author(uuidv4());
  }

  getKey() {

  }

  merge(other) {
    if (!(other instanceof Author))
      throw new Error("Can't merge with something that's not an Author");
    return new Author(
        this.uuid || other.uuid,
        this.name || other.name,
        this.email || other.email,
        this.username || other.username,
        this.organization || other.organization
    );
  }
}

const parse = regexp => text => regexp.exec(text)[1];
const parseUsername = parse(/ from (.+?)\//);

const searchAuthor = (authors, {uuid, username, email, name}) => {
  if (uuid !== undefined && authors[uuid] !== undefined)
    return authors[uuid];

  for (let author of valuesOf(authors)) {
    if ((author.username !== undefined && author.username === username) ||
        (author.email !== undefined && author.email === email) ||
        (author.name !== undefined && author.name === name))
      return Option.of(author).map(Author.fromJson);
  }
  return Option.empty();
};

const valuesOf = obj => Object.values(obj);

exports.feedAuthors = json => {
  const valuesOf1 = valuesOf(json);
  valuesOf1
      .map(Author.fromJson)
      .map(incomingAuthor => {
        const searchAuthor1 = searchAuthor(authors, incomingAuthor);
        const value = Author.empty();
        const orElse = searchAuthor1.orElse(value);
        const merge = orElse.merge(incomingAuthor);
        return merge;
      })
      .forEach(author => authors[author.uuid] = author);
  console.log(authors);
};

exports.feedCommit = commit => {
  if (commit.committerName === "GitHub") {
    // This is a "merge commit" type. The author is the guy who merged the PR, not the real author
    const incomingAuthor = Author.fromJson({username: parseUsername(commit.title)});
    const author = searchAuthor(authors, incomingAuthor).orElse(Author.empty()).merge(incomingAuthor);
    authors[author.uuid] = author;
  } else {
    // This is a "squash merge" or a "rebase and merge" type
    const incomingAuthor = Author.fromJson({
      name: commit.authorName,
      email: commit.authorEmail.endsWith('users.noreply.github.com') ? undefined : commit.authorEmail,
      username: commit.authorEmail.endsWith('users.noreply.github.com') ? commit.authorEmail.substring(0, commit.authorEmail.indexOf("@")) : undefined
    });
    const author = searchAuthor(authors, incomingAuthor).orElse(Author.empty()).merge(incomingAuthor);
    authors[author.uuid] = author;
  }
};

exports.usernameByEmail = (email, name) => {
  const beforeAt = email.substring(email.indexOf('+') + 1, email.indexOf('@'));
  if (email.endsWith("users.noreply.github.com")) {
    usernamesByEmail[email] = beforeAt;
    namesByUsername[beforeAt] = name;
    usernamesByEmail.save();
    namesByUsername.save();
    return beforeAt;
  }
  return usernamesByEmail[email] !== undefined ? usernamesByEmail[email] : beforeAt;
};

exports.nameByUsername = username => namesByUsername[username] !== undefined ? namesByUsername[username] : username;

exports.print = () => {
  console.log(namesByUsername);
  console.log(usernamesByEmail)
};
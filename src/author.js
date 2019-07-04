const uuidv4 = require('uuid').v4;
const Option = require('./option');
const sha1 = require('sha1');

class Author {
  constructor(uuid, name, emailHash, username, organization) {
    this.uuid = uuid;
    this.name = name;
    this.emailHash = emailHash;
    this.username = username;
    this.organization = organization;
  }

  static fromJson({uuid, name, email, emailHash, username, organization}) {
    uuid = Option.of(uuid).orElseGet(uuidv4);
    emailHash = Option.race(Option.of(emailHash), Option.of(email).map(sha1)).orUndefined();
    return new Author(uuid, name, emailHash, username, organization);
  }

  static empty() {
    return new Author(uuidv4());
  }

  merge(other) {
    if (!(other instanceof Author))
      throw new Error("Can't merge with something that's not an Author");
    return new Author(
      this.uuid || other.uuid,
      this.name || other.name,
      this.emailHash || other.emailHash,
      this.username || other.username,
      this.organization || other.organization
    );
  }

  buildSignature() {
    return [
      Option.of(this.name),
      Option.of(this.username).map(username => username.startsWith("@") ? username : `@${username}`),
      Option.of(this.organization).map(organization => `(${organization})`)
    ].filter(o => o.isPresent()).map(o => o.get()).join(" ");
  }
}

module.exports = Author;

const Preferences = require('preferences');
const namesByUsername = new Preferences('org.opendatakit.release-notes-generator.names-by-username', {}, {encrypt: false, format: 'json'});
const usernamesByEmail = new Preferences('org.opendatakit.release-notes-generator.usernames-by-email', {}, {encrypt: false, format: 'json'});

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

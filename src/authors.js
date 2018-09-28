const Preferences = require('preferences');
const namesByUsername = new Preferences('generate-release-notes.names-by-username', {}, {encrypt: false, format: 'json'});
const usernamesByEmail = new Preferences('generate-release-notes.usernames-by-email', {}, {encrypt: false, format: 'json'});

module.exports = {
  usernameByEmail(email, name) {
    const beforeAt = email.substring(0, email.indexOf('@'));
    if (email.endsWith("users.noreply.github.com")) {
      usernamesByEmail[email] = beforeAt;
      namesByUsername[beforeAt] = name;
      usernamesByEmail.save();
      namesByUsername.save();
      return beforeAt;
    }
    return usernamesByEmail[email] !== undefined ? usernamesByEmail[email] : beforeAt;
  },
  nameByUsername(username) {
    return namesByUsername[username] !== undefined ? namesByUsername[username] : username;
  }
};
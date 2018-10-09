const _exec = require('util').promisify(require('child_process').exec);

exports.exec = (command, opts) => _exec(command, opts);

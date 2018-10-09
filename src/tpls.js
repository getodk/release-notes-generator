const path = require('path');
const readFile = require('util').promisify(require('fs').readFile);

exports.read = async tplName => readFile(path.resolve(__dirname, `templates/${tplName}.ejs`)).then(c => c.toString("utf8"));
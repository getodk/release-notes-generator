exports.get = key => obj => obj[key];
exports.comparingBy = getter => (a, b) => getter(a) < getter(b) ? -1 : getter(a) > getter(b) ? 1 : 0;

exports.groupBy = (classifierFn, items) => items.reduce(
    (result, item) => ({
      ...result,
      [classifierFn(item)]: [...(result[classifierFn(item)] || []), item,],
    }),
    {},
);
exports.map = fn => array => array.map(fn);
exports.filter = fn => array => array.filter(fn);

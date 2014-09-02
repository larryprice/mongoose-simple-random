module.exports = exports = function(schema, options) {
  options = options || {};
  schema.statics.findRandom = function(conditions, fields, options, callback) {
    if (typeof conditions === 'function') {
      callback = conditions;
      conditions = {};
    } else if (typeof fields === 'function') {
      callback = fields;
      fields = {};
    } else if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    var limit = 1;
    if (options && options.count) {
      limit = options.count;
    }

    this.find(conditions, fields, options, function(err, docs) {
      if (err) {
        callback(err, undefined);
      } else {
        if (limit > 1) {
          var results = [];
          for (var i = 0; i < limit; ++i) {
            results.push(docs[Math.floor(Math.random() * docs.length)])
          }
          callback(undefined, results);
        } else {
          callback(undefined, docs[Math.floor(Math.random() * docs.length)]);
        }
      }
    });
  };
};
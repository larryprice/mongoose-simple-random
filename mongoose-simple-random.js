module.exports = exports = function(schema) {
  schema.statics.findRandom = function(conditions, fields, options, callback) {
    var limit = 1,
      args = checkParams(conditions, fields, options, callback);
    if (options && options.count) {
      limit = options.count;
      delete options.count
    }

    var _this = this;

    _this.count(args.conditions, function(err, num) {
      if (err) {
        return args.callback(err, undefined);
      }
      var start = Math.max(0, Math.floor((num-limit)*Math.random()));
      _this.find(args.conditions, args.fields, args.options).skip(start).limit(limit).exec(function(err, docs) {
        if (err) {
          return args.callback(err, undefined);
        }
        return args.callback(undefined, docs);
      });
    });
  };

  schema.statics.findOneRandom = function(conditions, fields, options, callback) {
    var args = checkParams(conditions, fields, options, callback);
    this.find(args.conditions, args.fields, args.options, function(err, docs) {
      if (err) {
        args.callback(err, undefined);
      } else {
        args.callback(undefined, docs[Math.floor(Math.random() * docs.length)]);
      }
    });
  };

  var checkParams = function(conditions, fields, options, callback) {
    if (typeof conditions === 'function') {
      callback = conditions;
      conditions = {};
      fields = {};
      options = {};
    } else if (typeof fields === 'function') {
      callback = fields;
      fields = {};
      options = {};
    } else if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    return {
      conditions: conditions,
      fields: fields,
      options: options,
      callback: callback
    }
  };
};
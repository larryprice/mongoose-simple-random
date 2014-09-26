module.exports = exports = function(schema) {
  schema.statics.findRandom = function(conditions, fields, options, callback) {
    var args = checkParams(conditions, fields, options, callback);

    var limit = 1;

    if (args.options.limit) {
      limit = args.options.limit;
      delete args.options.limit;
    }

    var _this = this;

    _this.count(args.conditions, function(err, num) {
      if (err) {
        return args.callback(err, undefined);
      }
      var start = Math.max(0, Math.floor((num-limit)*Math.random()));
      args.options.skip = start;
      args.options.limit = limit;
      _this.find(args.conditions, args.fields, args.options).exec(function(err, docs) {
        if (err) {
          return args.callback(err, undefined);
        }
        return args.callback(undefined, docs);
      });
    });
  };

  schema.statics.findOneRandom = function(conditions, fields, options, callback) {
    var args = checkParams(conditions, fields, options, callback);

    if (args.options.limit) {
      limit = args.options.limit;
      delete args.options.limit;
    }

    var _this = this;

    _this.count(args.conditions, function(err, num) {
      if (err) {
        return args.callback(err, undefined);
      }
      var start = Math.max(0, Math.floor(num*Math.random()));
      args.options.skip = start;
      _this.findOne(args.conditions, args.fields, args.options).exec(function(err, doc) {
        if (err) {
          return args.callback(err, undefined);
        }
        return args.callback(undefined, doc);
      });
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

    if (options.skip) {
      delete options.skip;
    }

    return {
      conditions: conditions,
      fields: fields,
      options: options,
      callback: callback
    }
  };
};
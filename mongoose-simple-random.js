module.exports = exports = function (schema) {
  schema.statics.findRandom = function (conditions, fields, options, callback) {
    var args = checkParams(conditions, fields, options, callback),
        _this = this;

    return _this.count(args.conditions, function(err, count) {
      var limit = 1,
        populate = null;
      if (err) {
        return args.callback(err, undefined);
      }
      if (args.options.limit) {
        limit = args.options.limit;
        delete args.options.limit;
      }
      if (limit > count) {
        limit = count;
      }
      if (args.options.populate) {
        populate = args.options.populate;
        delete args.options.populate;
      }

      var range = function(length) {
        return Array(length).fill(null).map(function(cv, i) {return i});
      };

      var random = function(max) {
        return Math.floor(Math.random() * (max+1));
      };

      var shuffle = function(a) {
        var length = a.length,
            shuffled = Array(length);
        for (var index = 0, rand; index < length; ++index) {
          rand = random(index);
          if (rand !== index) shuffled[index] = shuffled[rand];
          shuffled[rand] = a[index];
        }
        return shuffled;
      };

      var sample = function(a, n) {
        return shuffle(a).slice(0, Math.max(0, n));
      };

      var asyncMap = function(items, next, callback) {
        var transformed = new Array(items.length),
            count = 0,
            halt = false;

        items.forEach(function(item, index) {
          next(item, function(error, transformedItem) {
            if (halt) return;
            if (error) {
              halt = true;
              return callback(error);
            }
            transformed[index] = transformedItem;
            if (++count === items.length) return callback(undefined, transformed);
          });
        });
      };

      var docs = [];
      var results = asyncMap(sample(range(count), limit), (item, next) => {
        args.options.skip = item;
        var find = _this.findOne(args.conditions, args.fields, args.options);
        if (populate) {
          find.populate(populate);
        }
        find.exec(function (err, doc) {
          if (err) {
            return next(err);
          }
          return next(undefined, doc);
        });
      }, (error, contents) => {
        if (error) { args.callback(error); }
        args.callback(undefined, contents);
      });
    });
/*
    _this.count(args.conditions, function (err, num) {
      if (err) {
        return args.callback(err, undefined);
      }
      if (limit > num) {
        limit = num;
      }
      var start = Math.floor(Math.random() * (num - limit + 1));
      args.options.skip = start;
      args.options.limit = limit;
      var find = _this.find(args.conditions, args.fields, args.options);
      if (populate) {
        find.populate(populate);
      }
      find.exec(function (err, docs) {
        if (err) {
          return args.callback(err, undefined);
        }
        return args.callback(undefined, docs);
      });
    });
*/
  };

  schema.statics.findOneRandom = function (conditions, fields, options, callback) {
    var args = checkParams(conditions, fields, options, callback);
    var populate;

    if (args.options.limit) {
      delete args.options.limit;
    }

    if (args.options.populate) {
      populate = args.options.populate;
      delete args.options.populate;
    }

    var _this = this;

    _this.count(args.conditions, function (err, num) {
      if (err) {
        return args.callback(err, undefined);
      }
      var start = Math.floor(num * Math.random());
      args.options.skip = start;
      var find = _this.findOne(args.conditions, args.fields, args.options);
      if (populate) {
        find.populate(populate);
      }
      find.exec(function (err, doc) {
        if (err) {
          return args.callback(err, undefined);
        }
        return args.callback(undefined, doc);
      });
    });
  };

  var checkParams = function (conditions, fields, options, callback) {
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

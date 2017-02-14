// Utility methods - some were pulled partially from other MIT-licensed projects
var utils = (function () {
  var random = function(max) { return Math.floor(Math.random() * (max+1)); };
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

  var range = function(length) {return Array(length).fill(null).map(function(cv, i) {return i}); };
  var sample = function(a, n) { return shuffle(a).slice(0, Math.max(0, n)); };
  var randomMap = function(count, limit, next, callback) { return asyncMap(sample(range(count), limit), next, callback); };

  var asyncMap = function(items, next, callback) {
    var transformed = new Array(items.length),
        count = 0,
        halt = false;

    if (items.length === 0) {
      return callback()
    }

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

  return {
    randomMap: randomMap,
    checkParams: checkParams
  };
}());

module.exports = exports = function (schema) {
  schema.statics.findRandom = function (conditions, fields, options, callback) {
    var args = utils.checkParams(conditions, fields, options, callback),
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
      return utils.randomMap(count, limit, (item, next) => {
        args.options.skip = item;
        var find = _this.findOne(args.conditions, args.fields, args.options);
        if (populate) {
          find.populate(populate);
        }
        find.exec(next);
      }, args.callback);
    });
  };

  schema.statics.findOneRandom = function (conditions, fields, options, callback) {
    var args = utils.checkParams(conditions, fields, options, callback);

    args.options.limit = 1;
    this.findRandom(args.conditions, args.fields, args.options, function(err, docs) {
      if (docs && docs.length === 1) {
        return args.callback(err, docs[0]);
      }

      if (!err) {
        err = "findOneRandom yielded no results.";
      }

      return args.callback(err);
    });
  };
};

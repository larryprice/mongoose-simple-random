var _ = require('lodash');

function asyncLoop(iterations, func, callback) {
  var index = 0;
  var done = false;
  var loop = {
    next: function () {
      if (done) {
        return;
      }

      if (index < iterations) {
        index++;
        func(loop);

      } else {
        done = true;
        callback();
      }
    },

    iteration: function () {
      return index - 1;
    },

    break: function () {
      done = true;
      callback();
    }
  };
  loop.next();
  return loop;
}

module.exports = exports = function (schema) {
  schema.statics.findOneRandom = function (conditions, fields, options, callback) {
    var args = checkParams(conditions, fields, options, callback);

    if (args.options.limit) {
      limit = args.options.limit;
      delete args.options.limit;
    }

    var _this = this;

    _this.count(args.conditions, function (err, num) {
      if (err) {
        return args.callback(err, undefined);
      }
      var start = Math.floor(num * Math.random());
      args.options.skip = start;
      _this.findOne(args.conditions, args.fields, args.options).exec(function (err, doc) {
        if (err) {
          return args.callback(err, undefined);
        }
        return args.callback(undefined, doc);
      });
    });
  };

  schema.statics.findRandom = function (conditions, fields, options, callback) {
    var args = checkParams(conditions, fields, options, callback);
    var _this = this;
    var limit = 1;

    // Since we gonna use the findOneRandom function to get more then one document from collection
    // we need to store one's _ids that already have been found in order to avoid duplicates in the result set.
    var itemsFound = [];

    if (args.options.limit) {
      limit = args.options.limit;
      delete args.options.limit;
    }

    asyncLoop(limit, function (loop) {
        if (itemsFound.length) {
          _.merge(conditions, {
            _id: {'$nin': _.pluck(itemsFound, '_id')}
          });
        }
        schema.statics.findOneRandom.call(_this, conditions, fields, options, function (err, doc) {
          if (err) {
            loop.break();
            return args.callback(err, undefined);
          }
          if (!doc) {
            loop.break();
          }
          itemsFound.push(doc);
          loop.next();
        });
      },
      function () {
        return args.callback(undefined, itemsFound);
      }
    );

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

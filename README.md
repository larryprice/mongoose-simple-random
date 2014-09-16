### mongoose-simple-random

Author: Larry Price  
Website: [larry-price.com](http://larry-price.com)  
Email: <larry.price.dev@gmail.com> 

####Description

Simple and easy-to-use NodeJS Mongoose Schema plugin to find random documents.

#### Usage

``` javascript
var random = require('mongoose-simple-random');

var s = new Schema({
  message: String
});
s.plugin(random);

Test = mongoose.model('Test', s);

// Find a single random document
Test.findOneRandom(function(err, result) {
  if (!err) {
    console.log(result);
  }
});

// Find "count" random documents (defaults to array of 1)
Test.findRandom({}, {}, {count: 5}, function(err, results) {
  if (!err) {
    console.log(results);
  }
});

// Parameters match parameters for "find"
var filter = { playlist: { $in: ['hip-hop', 'rap'] } };
var fields = { name: 1, description: 0 };
var options = { skip: 10, limit: 10 };
Test.findRandom(filter, fields, options, function(err, results) {
  if (!err) {
    console.log(results);
  }
});
```

## Tests

```
$ npm test
```

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality. Lint and test your code.

## Release History

* 0.1.0 Initial release
* 0.2.0 API change - findRandom always returns array, findOneRandom returns single item

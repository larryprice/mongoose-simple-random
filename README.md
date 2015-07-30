### mongoose-simple-random

Author: Larry Price  
Website: [larry-price.com](https://larry-price.com)  
Email: <larry.price.dev@gmail.com> 

#### Description

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
    console.log(result); // 1 element
  }
});

// Find "limit" random documents (defaults to array of 1)
Test.findRandom({}, {}, {limit: 5}, function(err, results) {
  if (!err) {
    console.log(results); // 5 elements
  }
});

// Parameters match parameters for "find"
var filter = { genre: { $in: ['adventure', 'point-and-click'] } };
var fields = { name: 1, description: 0 };
var options = { skip: 10, limit: 10 };
Test.findRandom(filter, fields, options, function(err, results) {
  if (!err) {
    console.log(results); // 10 elements, name only, in genres "adventure" and "point-and-click" 
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
* 0.2.1 README update
* 0.3.0 API change - flip-flopping on "count", use "limit" to tell findByRandom how many elements to return

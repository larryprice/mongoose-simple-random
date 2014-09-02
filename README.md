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
s.findRandom(function(err, result) {
  if (!err) {
    console.log(result);
  }
});

// Find "count" random documents (defaults to 1)
s.findRandom({}, {}, {count: 5}, function(err, results) {
  if (!err) {
    console.log(results);
  }
});

// Parameters match parameters for "find"
var filter = { playlist: { $in: ['hip-hop', 'rap'] } };
var fields = { name: 1, description: 0 };
var options = { skip: 10, limit: 10 };
s.findRandom(filter, fields, options, function(err, results) {
  if (!err) {
    console.log(results);
  }
});
```
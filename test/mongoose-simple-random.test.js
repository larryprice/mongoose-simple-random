var random = require('../mongoose-simple-random'),
  mockgoose = require('mockgoose'),
  mongoose = require('mongoose'),
  async = require('async'),
  Schema = mongoose.Schema,
  should = require('chai').should();

mockgoose(mongoose);

describe('mongoose-simple-random', function () {
  var Test;

  describe('multiple documents', function () {
    before(function () {
      mockgoose.reset();

      var s = new Schema({
        message: String,
        urls: [ { type: Schema.Types.ObjectId, ref: "Url" } ]
      });
      s.plugin(random);
      Test = mongoose.model('Test', s);

      Test.create({
        message: "this"
      });
      Test.create({
        message: "is"
      });
      Test.create({
        message: "not"
      });
      Test.create({
        message: "a"
      });
      Test.create({
        message: "drill"
      });
    });

    it('gets a single doc at random', function (done) {
      Test.findOneRandom(function (err, result) {
        should.not.exist(err);
        result.should.have.property('message');
        result.should.have.property('_id');
        result.should.have.property('__v');
        done();
      });
    });

    it('gets 3 docs at random', function (done) {
      Test.findRandom({}, {}, {
        limit: 3
      }, function (err, result) {
        should.not.exist(err);
        result.should.have.length(3);
        for (var i = 0; i < 3; ++i) {
          result[i].should.have.property('message');
          result[i].should.have.property('_id');
          result[i].should.have.property('__v');
        }
        // check that they're distinct
        for (var i = 0; i < 3; i++) {
          for (var j = 0; j < 3; j++) {
            if (i == j) continue;
            result[i].should.not.be.equal(result[j]);
          }
        }
        done();
      });
    });
  });

  describe('document population', function () {
    var urls = ['https://www.npmjs.com','https://github.com'];

    before(function (done){
      mockgoose.reset();

      var u = new Schema({ url: String });
      var Url = mongoose.model('Url', u);
      var urlIds = [];
      var tasks = [];

      urls.forEach(function (url) {
        tasks.push(function (cb) {
          Url.create({ url: url }, function (err, url) {
            urlIds.push(url._id);
            cb();
          });
        });
      });

      tasks.push(function (cb) {
        Test.create({ message: 'stuff', urls: urlIds }, function () { cb(); });
      });

      async.waterfall(tasks, function () { done(); });
    });

    it('gets ids without populating document', function (done) {
      Test.findOneRandom(function (err, result) {
        result.urls.length.should.equal(2);
        for (var i = 0; i < result.urls.length; i++) {
          result.urls[i].should.be.instanceOf(mongoose.Types.ObjectId);
        }
        done();
      });
    });

    it('populates document with url objects', function (done) {
      Test.findOneRandom({}, {}, {
        populate: 'urls'
      }, function (err, result) {
        result.urls.length.should.equal(2);
        result.urls.forEach(function (urlObject, i) {
          urlObject.url.should.equal(urls[i]);
        });
        done();
      });
    });
  });

  describe('edge cases', function () {
    before(function () {
      mockgoose.reset();

      Test.create({
        message: "this"
      });
    });

    it('gets the only document with findOne', function (done) {
      Test.findOneRandom(function (err, result) {
        should.not.exist(err);
        should.exist(result);
        result.should.have.property('message');
        result.message.should.equal("this");
        result.should.have.property('_id');
        result.should.have.property('__v');
        done();
      });
    });

    it('gets the only document with findMany', function (done) {
      Test.findRandom(function (err, result) {
        should.not.exist(err);
        should.exist(result);
        result.should.have.length(1);
        result[0].should.have.property('message');
        result[0].message.should.equal("this");
        result[0].should.have.property('_id');
        result[0].should.have.property('__v');
        done();
      });
    });

    it('doesnt freak out when limit is huge', function (done) {
      Test.findRandom({}, {}, {
        limit: 1000
      }, function (err, result) {
        should.not.exist(err);
        should.exist(result);
        result.should.have.length(1);
        result[0].should.have.property('message');
        result[0].message.should.equal("this");
        result[0].should.have.property('_id');
        result[0].should.have.property('__v');
        done();
      });
    });
  });
});
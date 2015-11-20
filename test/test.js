var expect = require('chai').expect;
var request = require('superagent');

describe('OMS core server', function() {

  describe('server serves content at /users', function() {
    var url = 'http://localhost:8080/users';

    it('returns status 200', function(done) {
      request.get(url).end(function(err, res) {
        expect(res).to.exist;
        expect(res.status).to.equal(200);
        done();
      });
    });

  });

});

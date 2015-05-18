
//PREAMBLE STUFF
var assert = require('assert');
var ldap = require('ldapjs');

var client = ldap.createClient({
  url: 'ldap://127.0.0.1:389'
});

var ldap_top_dn = 'dc=aegee, dc=org';

client.bind('cn=admin,'+ldap_top_dn, 'aegee', function(err) { //TODO: change to a privileged but non root
  assert.ifError(err);
});


//API DEFINITION
exports.findAllUsers = function(req, res , next){
    res.setHeader('Access-Control-Allow-Origin','*');

    //set search parameters
    var opts = {
      filter: '(&(!(uid=fabrizio.bellicano))(objectClass=aegeePersonFab))',
      scope: 'sub'
    };
    var searchDN = 'ou=people, '+ldap_top_dn;

    client.search(searchDN, opts, function(err, ldapres) {
        assert.ifError(err);

        var results = [];

        ldapres.on('searchEntry', function(entry) {
          console.log('\nentry:');
          console.log(entry.object);
          results.push(entry.object);
        });
        ldapres.on('searchReference', function(referral) {
          console.log('referral: ' + referral.uris.join());
        });
        ldapres.on('error', function(err) {
          console.error('error: ' + err.message);
        });
        ldapres.on('end', function(result) {
          console.log('end status: ' + result.status);
          res.send(200, results);          
        });

    });

 
}
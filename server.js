var assert = require('assert');
var restify = require('restify');
 
var ip_addr = '127.0.0.1';
var port    =  '8080';
 
var server = restify.createServer({
    name : "calaf"
});

var ldap = require('ldapjs');
var client = ldap.createClient({
  url: 'ldap://127.0.0.1:389'
});

var ldap_top_dn = 'dc=aegee, dc=org';

client.bind('cn=admin,dc=aegee,dc=org', 'aegee', function(err) { //TODO: change to a privileged but non root
  assert.ifError(err);
});

server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.CORS());
 

var userPath = '/users'
server.get({path : userPath , version : '0.0.1'} , findAllUsers);
//server.get({path : userPath +'/:userId' , version : '0.0.1'} , findUser);


function findAllUsers(req, res , next){
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


server.listen(port , function(){
    console.log('%s listening at %s ', server.name , server.url);
});

//PREAMBLE STUFF
var assert = require('assert');
var ldap = require('ldapjs');

var client = ldap.createClient({
  url: 'ldap://127.0.0.1:389'
});

var ldap_top_dn = 'o=aegee, c=eu';

client.bind('cn=admin,'+ldap_top_dn, 'aegee', function(err) { //TODO: change to a privileged but non root
  assert.ifError(err);
});


//API DEFINITION

exports.findAllUsers = function(req, res , next){
    res.setHeader('Access-Control-Allow-Origin','*');

    //set search parameters
    var opts = {
      filter: '(objectClass=aegeePersonFab)',
      scope: 'sub',
      attributes: ''
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

exports.findUser = function(req, res , next){
    res.setHeader('Access-Control-Allow-Origin','*');

    //set search parameters
    var opts = {
      filter: '(&(uid='+req.params.userId+')(objectClass=aegeePersonFab))',
      scope: 'sub',
      attributes: ''
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

exports.findMemberships = function(req, res , next){
    res.setHeader('Access-Control-Allow-Origin','*');

    //set search parameters
    var opts = {
      filter: '(objectClass=aegeePersonMembership)',
      scope: 'sub',
      attributes: ''
    };
    var searchDN = 'uid='+req.params.userId+', ou=people, '+ldap_top_dn;

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

exports.findAllAntennae = function(req, res , next){
    res.setHeader('Access-Control-Allow-Origin','*');

    //set search parameters
    var opts = {
      filter: '(objectClass=aegeeBodyFab)',
      scope: 'one',
      attributes: ''
    };
    var searchDN = 'ou=antennae, '+ldap_top_dn;

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

exports.findAntenna = function(req, res , next){
    res.setHeader('Access-Control-Allow-Origin','*');

    //set search parameters
    var opts = {
      filter: '(&(bodyCode='+req.params.bodyCode+')(objectClass=aegeeBodyFab))',
      scope: 'sub',
      attributes: ''
    };
    var searchDN = 'ou=antennae, '+ldap_top_dn;

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

exports.createUser = function(req, res , next){
    res.setHeader('Access-Control-Allow-Origin','*');

    var baseDN = 'ou=people, '+ldap_top_dn;

    var entry = {
      sn: req.params.sn,
      givenName: req.params.givenName,
      cn: req.params.cn,
      uid: req.params.givenName+"."+req.params.sn, //TODO: check clashes between existing UIDs
      mail: req.params.mail,
      userPassword: req.params.userPassword,
      birthDate: req.params.birthDate,
      objectclass: 'aegeePersonFab'
    };


    client.add('uid='+entry.uid+","+baseDN, entry, function(err) {
      assert.ifError(err);
    });

    console.log("added entry: ");
    console.log(entry);

    res.send(200, entry);   
}

exports.createApplicationOld = function(req, res , next){ //TODO: extend to multiple memberships?
    res.setHeader('Access-Control-Allow-Origin','*');

    var baseDN = 'uid='+req.params.userId+', ou=applications, '+ldap_top_dn;

    //TODO: check if UID already existing

    var entry = {
      bodyCategory: req.params.bodyCategory,
      bodyCode: req.params.bodyCode, //TODO: check clashes between existing UIDs
      bodyNameAscii: req.params.bodyNameAscii,
      mail: req.params.mail,
      memberSinceDate: req.params.memberSinceDate,
      memberUntilDate: req.params.memberUntilDate,
      netcom: req.params.netcom,
      objectclass: 'aegeePersonMembership'
    };

    client.add('bodyCode='+entry.bodyCode+","+baseDN, entry, function(err) {
      assert.ifError(err);
    });

    console.log("added entry under "+baseDN+": ");
    console.log(entry);

    res.send(200, entry);   
}

exports.createApplication = function(req, res , next){ //TODO: extend to multiple memberships?
    res.setHeader('Access-Control-Allow-Origin','*');

    var baseDN = 'uid='+req.params.userId+', ou=people, '+ldap_top_dn;

    //TODO: check if UID already existing

    var entry = {
      bodyCategory: req.params.bodyCategory,
      bodyCode: req.params.bodyCode, //TODO: check clashes between existing UIDs
      bodyNameAscii: req.params.bodyNameAscii,
      mail: req.params.mail,
      memberSinceDate: req.params.memberSinceDate,
      memberUntilDate: req.params.memberUntilDate,
      netcom: req.params.netcom,
      memberType: 'Applicant',
      objectclass: 'aegeePersonMembership'
    };

    client.add('bodyCode='+entry.bodyCode+","+baseDN, entry, function(err) {
      assert.ifError(err);
    });

    console.log("added entry under "+baseDN+": ");
    console.log(entry);

    res.send(200, entry);   
}
//createUser = creates user + creates membership UNDER APPLICATION (case 1, new member)
//AND
//createApplication = findUser + copia under application + createMembership (case 2, new applic)
//then generalise
//case 1) doesnt exist -> applies to local first
//case 2) exists .     -> applies to local/body/whatever

exports.approveMembershipOld = function(req, res , next){ //TODO: extend to multiple memberships?
    res.setHeader('Access-Control-Allow-Origin','*');

    var baseDN = 'uid='+req.params.userId+', ou=people, '+ldap_top_dn;
    var fromDN = 'uid='+req.params.userId+', ou=applications, '+ldap_top_dn;

    //TODO: check if UID already existing

    client.modifyDN( fromDN, baseDN, function(err) {
      assert.ifError(err);
    });

    //testing if path is successful
    var opts = {
      filter: '(&(uid='+req.params.userId+')(objectClass=aegeePersonFab))',
      scope: 'sub',
      attributes: ''
    };
    var searchDN = 'ou=people, '+ldap_top_dn;

  var results = [];

    client.search(searchDN, opts, function(err, ldapres) {
        assert.ifError(err);

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
        });
    });


    console.log("moved entry "+fromDN+" under "+baseDN+": ");
    console.log(results);

    //TODO: membership should begin from acceptance date, not from application date (maybe)

    res.send(200, results);   
}

exports.approveMembership = function(req, res , next){ //TODO: extend to multiple memberships?
    res.setHeader('Access-Control-Allow-Origin','*');

    var baseDN = 'bodyCode='+req.params.bodyCode+',uid='+req.params.userId+', ou=people, '+ldap_top_dn;

    var change = new ldap.Change({
      operation: 'replace',
      modification: {
        memberType: 'Member'
      }
    });

    client.modify( baseDN, change, function(err) {
      assert.ifError(err);
    });


    //testing if path is successful
    var opts = {
      filter: '(&(uid='+req.params.userId+')(objectClass=aegeePersonFab))',
      scope: 'sub',
      attributes: ''
    };
    var searchDN = 'ou=people, '+ldap_top_dn;

var results = [];

    client.search(searchDN, opts, function(err, ldapres) {
        assert.ifError(err);

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
        });
    });


    console.log(baseDN+" is now member: ");
    console.log(results);

    //TODO: membership should begin from acceptance date, not from application date (maybe)

    res.send(200, results);   
}


//HELPER METHODS

searchLDAP = function() {};
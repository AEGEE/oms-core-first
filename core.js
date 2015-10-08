
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

//v0.0.1 - remember to bump version numbers
exports.findAllUsers = function(req, res , next){
    res.setHeader('Access-Control-Allow-Origin','*');
    console.log("findAllUsers");

    //var results = searchLDAP("aegeePersonFab", 'ou=people, '+ldap_top_dn ); //type, basedn
    //console.log(results);

    //set search parameters
    var opts = {
      filter: '(objectClass=aegeePersonFab)',
      scope: 'sub',
      attributes: ''
    };

    var searchDN = 'ou=people, '+ldap_top_dn ;

    client.search(searchDN, opts, function(err, ldapres) {
        assert.ifError(err);

        var results = [];

        ldapres.on('searchEntry', function(entry) {
          //console.log('\nentry:');
          //console.log(entry.object);
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

//v0.0.1 - remember to bump version numbers
exports.findUser = function(req, res , next){
    res.setHeader('Access-Control-Allow-Origin','*');
    console.log("findUser");

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

//v0.0.1 - remember to bump version numbers
exports.findMemberships = function(req, res , next){
    res.setHeader('Access-Control-Allow-Origin','*');
    console.log("findMemberships");

    //set search parameters
    var opts = {
      filter: '(&(objectClass=aegeePersonMembership)!(memberType=Applicant))',
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

//v0.0.1 - remember to bump version numbers
exports.findApplications = function(req, res , next){ //cannot do "find all applications" method because of API call routes
    res.setHeader('Access-Control-Allow-Origin','*');
    console.log("findApplications");

    //set search parameters
    var opts = {
      filter: '(&(objectClass=aegeePersonMembership)(memberType=Applicant))',
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

//v0.0.1 - remember to bump version numbers
exports.findAllAntennae = function(req, res , next){
    res.setHeader('Access-Control-Allow-Origin','*');
    console.log("findAllAntennae");

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

//v0.0.1 - remember to bump version numbers
exports.findAntenna = function(req, res , next){
    res.setHeader('Access-Control-Allow-Origin','*');
    console.log("findAntennae");

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

//v0.0.1 - remember to bump version numbers
exports.createUser = function(req, res , next){
    res.setHeader('Access-Control-Allow-Origin','*');
    console.log("createUser");

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

    //TRIGGER: apply to body registered with
}

//v0.0.1 - remember to bump version numbers
exports.createAntenna = function(req, res , next){
    res.setHeader('Access-Control-Allow-Origin','*');
    console.log("createAntenna");

    var baseDN = 'ou=antennae, '+ldap_top_dn;

    var entry = {
      bodyCategory: req.params.bodyCategory,
      bodyCode: req.params.bodyCode, //TODO: check clashes between existing UIDs
      bodyNameAscii: req.params.bodyNameAscii,
      mail: req.params.mail,
      netcom: req.params.netcom,
      bodyStatus: "C",                //if newly created, automatically is Contact
      objectclass: 'aegeeBodyFab'
    };


    client.add('bodyCode='+entry.bodyCode+","+baseDN, entry, function(err) {
      assert.ifError(err);
    });

    console.log("added entry: ");
    console.log(entry);

    res.send(200, entry);   

    //TRIGGER: create local groups (e.g. board) entries
}

//v0.0.1 - remember to bump version numbers
exports.createApplication = function(req, res , next){ //TODO: extend to multiple memberships?
    res.setHeader('Access-Control-Allow-Origin','*');
    console.log("createApplication");

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

    //TRIGGER: send email to board of applied body  
}

//v0.0.1 - remember to bump version numbers
exports.modifyMembership = function(req, res , next){ //TODO: extend to multiple memberships?
    res.setHeader('Access-Control-Allow-Origin','*');
    console.log("modifyMembership");

    var baseDN = 'bodyCode='+req.params.bodyCode+',uid='+req.params.userId+', ou=people, '+ldap_top_dn;

    var change = new ldap.Change({
      operation: 'replace',
      modification: {
        memberType: req.params.memberType //if changed to "suspended", the system won't remember what was before that
      }
    });

    client.modify( baseDN, change, function(err) {
      assert.ifError(err);
    });


    //testing if path is successful
    var opts = {
      filter: '(&(uid='+req.params.userId+')(objectClass=aegeeMembershipFab))',
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

    //TRIGGER: send email to user about application to body confirmed/rejected
}


//HELPER METHODS

searchLDAP = function(searchType, searchDN) {

  //set search parameters
    var opts = {
      filter: '(objectClass='+searchType+')',
      scope: 'sub',
      attributes: ''
    };

    client.search(searchDN, opts, function(err, ldapres) {
        assert.ifError(err);

        var results = [];

        ldapres.on('searchEntry', function(entry) {
          //console.log('\nentry:');
          //console.log(entry.object);
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
          return(results);
        });

    });
}
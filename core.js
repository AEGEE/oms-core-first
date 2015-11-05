var verbose = false; //in case of debug

//PREAMBLE STUFF
var assert = require('assert');
var ldap = require('ldapjs');

var config = require('config.json')();

var client = ldap.createClient({
  url: config.ldap.url
});

var ldap_top_dn = 'o=aegee, c=eu';

client.bind('cn=admin,'+ldap_top_dn, config.ldap.rootpw, function(err) { //TODO: change to a privileged but non root
  assert.ifError(err);
});


//API DEFINITION

//v0.0.8 - remember to bump version numbers
exports.findAllUsers = function(req, res , next){
    res.setHeader('Access-Control-Allow-Origin','*');
    if(verbose) console.log("findAllUsers");
    
    var searchDN = 'ou=people, '+ldap_top_dn ;
    var filter = '(objectClass=aegeePersonFab)';

    searchLDAP(filter, searchDN, res );
}

//v0.0.8 - remember to bump version numbers
exports.findUser = function(req, res , next){
    res.setHeader('Access-Control-Allow-Origin','*');
    if(verbose) console.log("findUser");

    var searchDN = 'ou=people, '+ldap_top_dn;
    var filter = '(&(uid='+req.params.userId+')(objectClass=aegeePersonFab))';

    searchLDAP(filter, searchDN, res );
}

//this finds the membership *of a person*
//v0.0.8 - remember to bump version numbers
exports.findMemberships = function(req, res , next){
    res.setHeader('Access-Control-Allow-Origin','*');
    if(verbose) console.log("findMemberships");

    var searchDN = 'uid='+req.params.userId+', ou=people, '+ldap_top_dn;
    var filter = '(&(objectClass=aegeePersonMembership)!(memberType=Applicant))';

    searchLDAP(filter, searchDN, res );
}

//this finds the applications *to a body*
//v0.0.8 - remember to bump version numbers
exports.findApplications = function(req, res , next){ //cannot do "find all applications" method because of API call routes
    res.setHeader('Access-Control-Allow-Origin','*');
    if(verbose) console.log("findApplications");

    var searchDN = 'ou=people, '+ldap_top_dn;
    var filter = '(&(&(objectClass=aegeePersonMembership)(memberType=Applicant))(bodyCode='+req.params.bodyCode+'))';

    searchLDAP(filter, searchDN, res );
}

//this finds the members *of a body*
//v0.0.8 - remember to bump version numbers
exports.findMembers = function(req, res , next){ //cannot do "find all applications" method because of API call routes
    res.setHeader('Access-Control-Allow-Origin','*');
    if(verbose) console.log("findMembers");

    var searchDN = 'ou=bodies, '+ldap_top_dn;
    var filter = '(&(&(objectClass=aegeePersonMembership)(memberType=Member))(bodyCode='+req.params.bodyCode+'))';

    searchLDAP(filter, searchDN, res );
}

//v0.0.8 - remember to bump version numbers
exports.findAllAntennae = function(req, res , next){
    res.setHeader('Access-Control-Allow-Origin','*');
    if(verbose) console.log("findAllAntennae");

    var searchDN = 'ou=bodies, '+ldap_top_dn;
    var filter = '(&(objectClass=aegeeBodyFab)(bodyCategory=Local))';

    searchLDAP(filter, searchDN, res );
}

//v0.0.8 - remember to bump version numbers
exports.findAntenna = function(req, res , next){
    res.setHeader('Access-Control-Allow-Origin','*');
    if(verbose) console.log("findAntennae");

    var searchDN = 'ou=bodies, '+ldap_top_dn;
    var filter = '(&(bodyCode='+req.params.bodyCode+')(objectClass=aegeeBodyFab))';

    searchLDAP(filter, searchDN, res );
}

//v0.0.1 - remember to bump version numbers
exports.createUser = function(req, res , next){
    res.setHeader('Access-Control-Allow-Origin','*');
    if(verbose) console.log("createUser");

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
    if(verbose) console.log("createAntenna");

    var baseDN = 'ou=bodies, '+ldap_top_dn;

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
    if(verbose) console.log("createApplication");

    var baseDN = 'uid='+req.params.userId+', ou=people, '+ldap_top_dn;

    //TODO: check if UID already existing

    var entry = {
      bodyCategory: req.params.bodyCategory,
      bodyCode: req.params.bodyCode, //TODO: check clashes between existing UIDs
      bodyNameAscii: req.params.bodyNameAscii,
      mail: req.params.mail,
      uid: req.params.uid,
      cn: req.params.cn,
      memberSinceDate: req.params.memberSinceDate,
      memberUntilDate: req.params.memberUntilDate,
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
    if(verbose) console.log("modifyMembership");

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


//Usage: <filter, basedn, result object>
//  searchLDAP("objectClass=aegeePersonFab", 'ou=people, '+ldap_top_dn, res );
//v0.1.0
searchLDAP = function(searchFilter, searchDN, res) {

  //set search parameters
    var opts = {
      filter: searchFilter,
      scope: 'sub',
      attributes: ''
    };

    if(verbose) console.log("searchFilter is "+ searchFilter);

    client.search(searchDN, opts, function(err, ldapres) {
        assert.ifError(err);

        var results = [];

        ldapres.on('searchEntry', function(entry) {
          if(verbose) console.log('\nentry:\n');
          if(verbose) console.log(entry.object);
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
          res.send(200,results);
        });

    });
}


var assert = require('assert');

var config = require('./config.json');
var log = require('./logger');

var _mail = require('./mail.js')

var ldap = require('ldapjs');

var client = ldap.createClient({
  url: config.ldap.url,
  log: log
});

var ldap_top_dn = 'o=aegee, c=eu';//TODO what to do with it? where to put?

exports.bindSuper = function(){
    client.bind('cn=admin,' + ldap_top_dn, config.ldap.rootpw, function(err) { //TODO: change to a privileged but non root (#4)
      client.log.info({err: err}, 'LDAP client binding (super)');
      assert.ifError(err);
    });
};

this.bindSuper();

exports.bindUser = function(user,pass){
    client.bind( user + ldap_top_dn, pass, function(err) {
      client.log.info({err: err}, 'LDAP client binding');
      assert.ifError(err);
    });
};

//Usage: <filter, basedn, response, callback to execute on end>
//  searchLDAP("objectClass=aegeePersonFab", 'ou=people, '+ldap_top_dn, res, function(){...} );
//v0.1.2
exports.searchLDAPCron = function(searchFilter, searchDN, res, next) {
 
  //if next is not defined, just send the search result as response
  if(next === undefined){
    next = function(res, data){ 
                  res.send(200,data); 
               };
  }

  //set search parameters
    var opts = {
      filter: searchFilter,
      scope: 'sub',
      attributes: ''
    };

    var results = [];

    client.search(searchDN, opts, function(err, ldapres) {
        log.debug({searchDN: searchDN, searchFilter: searchFilter, err: err}, 'Client search');
        assert.ifError(err);

        ldapres.on('searchEntry', function(entry) {
          log.debug({entry: entry.object}, 'Client search: searchEntry');
          results.push(entry.object);
        });
        ldapres.on('searchReference', function(referral) {
          log.debug({referral: referral.uris.join()}, 'Client search: searchReference');
        });
        ldapres.on('error', function(err) {
          log.error({searchDN: searchDN, searchFilter: searchFilter, err: err}, 'Client search: error');
        });
        ldapres.on('end', function(result) {
          log.debug({result: result.status, results: results}, 'Client search: end');
          next(res, results);
        });
    });

};


//Format of the users: an array of json objects expressing the LDAP path of membership 
exports.modifyMembershipCron = function(users, memberType){

    var change = new ldap.Change({
      operation: 'replace',
      modification: {
        memberType: memberType //if changed to "suspended", the system won't remember what was before that
      }
    });
  
    //FOR EACH MEMBER TO MODIFY, call LDAP

    users.forEach(function(entry){

        client.modify(entry.dn, change, function(err) {
          log.info({change: change, err: err}, 'Modifying Membership');
          assert.ifError(err);

          //send mail accordingly
          var mailmessage = {
             to:      entry.cn+" <"+entry.mail+">",
             subject: "Your membership has expired",
             text:    "Hi "+entry.cn+", \n your membership for the body " + entry.bodyNameAscii + " \
                        has been suspended after automatic expiration"
          };
          _mail.sendMail(mailmessage);
        });

    });

};

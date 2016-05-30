
var assert = require('assert');

var config = require('./config.json');
var log = require('./logger');

var mail = require('./mail.js');

var ldap = require('ldapjs');

var client = ldap.createClient({
  url: config.ldap.url,
  log: log
});

var ldap_top_dn = 'o=aegee, c=eu';//TODO what to do with it? where to put?

exports.bindSuper = function(next){
    bindUser('cn=admin,' + ldap_top_dn, config.ldap.rootpw, next);
};

this.bindSuper();

function bindUser(user, pass, next){

  if(next === undefined){
    next = function(err) {
      client.log.info({err: err}, 'LDAP client binding of '+user);
      assert.ifError(err);
    };
  }
	
  client.bind( user, pass, next);
};

exports.bindUser = bindUser;

exports.addEntry = function(entry, baseDN, res, next){
	
  client.add(baseDN, entry, next.bind(entry, res));  //FIXME: the order of the parameters?? 
                                    //e.g. err should be before entry

};

//Usage: <filter, basedn, response, callback to execute on end>
//  searchLDAP("objectClass=aegeePersonFab", 'ou=people, '+ldap_top_dn, res, function(){...} );
//v0.1.4
exports.searchLDAP = function(searchFilter, searchDN, res, next) {

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
          var sanitizedEntry = entry.object;
          if(sanitizedEntry['userPassword']){
            delete sanitizedEntry['userPassword'];
          }
          results.push(sanitizedEntry);
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

//Format of the users: an array of json objects expressing the members
exports.modifyMembershipCron = function(users, memberType){

    //FOR EACH MEMBER TO MODIFY, call LDAP

    users.forEach(function(entry){

        modifyMembership(entry.dn, memberType, function(err) {
          log.info({change: memberType, err: err}, 'Modifying Membership (cron) for %s', entry.dn);
          assert.ifError(err);

          //send mail accordingly
          var mailmessage = {
             to:      entry.cn+" <"+entry.mail+">",
             subject: "Your membership has expired",
             text:    "Hi "+entry.cn+", \n your membership for the body " + entry.bodyNameAscii + " \
                        has been suspended after automatic expiration"
          };
          mail.sendMail(mailmessage);
        });

    });

};

//Format of the users: an array of json objects expressing the LDAP path of membership 
function modifyMembership(user, memberType, next){

//if next is not defined, just log
  if(next === undefined){
    next = function(err) {
          log.info({change: change, err: err}, 'Modifying Membership in %s', user);
          assert.ifError(err);
        };
  }
  
    //TODO: add handling of "remembering old status"
    //i.e. implement changelog
    
    var change = new ldap.Change({
      operation: 'replace',
      modification: {
        memberType: memberType //if changed to "suspended", the system won't remember what was before that
      }
    });

    client.modify(user, change, next);
};

exports.modifyMembership = modifyMembership;


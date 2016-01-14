

var _ldap = require('../config/ldap.js')
var ldap_top_dn = 'o=aegee, c=eu';



module.exports = function(agenda) {
  agenda.define('Check membership expiration', function(job, done) {

    var today = new Date();
    var date = today.getDate()+"/"+today.getMonth()+"/"+today.getFullYear();

    //Query (or receive queried object) for an array containing
    //ACTIVE memberships who have expiration date before Today()
    //--------------------
    var searchDN = 'ou=people, ' + ldap_top_dn;
    var filter = '(&(memberUntilDate=' + date + ')(objectClass=aegeePersonMembership))';
    //TODO: check Date() format vs ldap

    _ldap.searchLDAPCron(filter, searchDN, null, expireMemberships );


  });

  // More scheduled membership-related jobs (save member list every X months)
}

//USEFUL
function expireMembership(res, users){//res has to be burnt..

  console.log(users); //I am not even sure the format of the returned object from
                      //LDAP: they should have a dn field anyway..

  var usersDN = [];
  //we extract the DN of the users
  for(var i=0; i<users.length; ++i){
    usersDN.push(user[i].dn);
  }

  _ldap.modifyMembershipCron(users, "Suspended");

};

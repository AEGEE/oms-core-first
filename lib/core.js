//PREAMBLE STUFF
var assert = require('assert');
var ldap = require('./config/ldap.js');
var mail = require('./config/mail.js');
var microsoft = require('./config/MSauthHelper.js');

var log = require('./config/logger');

var config = require('./config/config.json');
var jwt    = require('jsonwebtoken');

var ldap_top_dn = 'o=aegee, c=eu';//TODO uppercase to state it isnt going to change


var appInitialSetup = function appInitialSetup(){
  //tokenMaster.requestToken('cn=admin,' + ldap_top_dn, config.ldap.rootpw);
  ldap.bindSuper();
  microsoft.authenticate();

}();

//TEST
exports.testmail = function(req,res,next){

  user = {
    mail: "fabrifaa@gmail.com",
    name: "gionnino"
  };

  message = {
    subject: "Test drive uno"
    //content: 
  }

  mail.sendMail(message, user);
};

//API DEFINITION

//v0.0.6 middleware
exports.verifyToken = function(req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.params.token || req.query.token || req.headers['x-access-token'];

  if (token) {

    jwt.verify(token, config.secret, function(err, decoded) {      
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });    
      } else {
        req.decoded = decoded;    
        next();
      }
    });

  } else {
    // return error if no token
    return res.send(403, { success: false, message: 'No token provided.' });
  }
};

//v0.0.6
exports.authenticate = function(req, res, next) {

  var uid = req.params.username;
  var password = req.params.password;
  
  log.info(uid, 'User is requesting a token');

  // find the user  
  ldap.bindUser('uid='+uid+',ou=services,o=aegee,c=eu', password, function(err) {
    if(err){
      log.info({err: err}, 'LDAP service binding');
      return res.json({ success: false, message: 'Authentication failed. ' });
    }
    
    var searchDN = 'ou=services, ' + ldap_top_dn;
    var filter = '(uid='+uid+')';
    ldap.searchLDAP(filter, searchDN, res, generateToken)
  });

  //console.log("done2");
};



//v0.1.0 - remember to bump version numbers
exports.findAllUsers = function(req, res , next) {
    req.log.debug({req: req}, 'findAllUsers request');
    res.setHeader('Access-Control-Allow-Origin', '*');

    var searchDN = 'ou=people, ' + ldap_top_dn;
    var filter = '(objectClass=aegeePersonFab)';

    ldap.searchLDAP(filter, searchDN, res);
};

//v0.1.0 - remember to bump version numbers
exports.findUser = function(req, res , next) {
    req.log.debug({req: req}, 'findUser request');
    res.setHeader('Access-Control-Allow-Origin', '*');

    var searchDN = 'ou=people, ' + ldap_top_dn;
    var filter = '(&(uid=' + req.params.userId + ')(objectClass=aegeePersonFab))';

    ldap.searchLDAP(filter, searchDN, res);
};

//this finds the membership *of a person*
//v0.1.0 - remember to bump version numbers
exports.findMemberships = function(req, res , next) {
    req.log.debug({req: req}, 'findMemberships request');
    res.setHeader('Access-Control-Allow-Origin', '*');

    var searchDN = 'uid=' + req.params.userId + ', ou=people, ' + ldap_top_dn;
    var filter = '(&(objectClass=aegeePersonMembership)!(memberType=Applicant))';

    ldap.searchLDAP(filter, searchDN, res);
};

//this finds the membership *of a person*
//v0.1.0 - remember to bump version numbers
exports.findApplicationsOfMember = function(req, res , next) {
    req.log.debug({req: req}, 'findApplicationsOfMember request');
    res.setHeader('Access-Control-Allow-Origin', '*');

    var searchDN = 'uid=' + req.params.userId + ', ou=people, ' + ldap_top_dn;
    var filter = '(&(objectClass=aegeePersonMembership)(memberType=Applicant))';

    ldap.searchLDAP(filter, searchDN, res);
};

//this finds the applications *to a body*
//v0.1.0 - remember to bump version numbers
exports.findApplications = function(req, res , next) { //cannot do "find all applications" method because of API call routes
    req.log.debug({req: req}, 'findApplications request');
    res.setHeader('Access-Control-Allow-Origin', '*');

    var searchDN = 'ou=people, ' + ldap_top_dn;
    var filter = '(&(&(objectClass=aegeePersonMembership)(memberType=Applicant))(bodyCode=' + req.params.bodyCode + '))';

    ldap.searchLDAP(filter, searchDN, res);
};

//this finds the members *of a body*
//v0.1.0 - remember to bump version numbers
exports.findMembers = function(req, res , next) { //cannot do "find all applications" method because of API call routes
    req.log.debug({req: req}, 'findMembers request');
    res.setHeader('Access-Control-Allow-Origin', '*');

    var searchDN = 'ou=people, ' + ldap_top_dn;
    var filter = '(&(&(objectClass=aegeePersonMembership)(memberType=Member))(bodyCode=' + req.params.bodyCode + '))';

    ldap.searchLDAP(filter, searchDN, res);
};

//v0.1.0 - remember to bump version numbers
exports.findAllAntennae = function(req, res , next) {
    req.log.debug({req: req}, 'findAllAntennae request');
    res.setHeader('Access-Control-Allow-Origin', '*');

    var searchDN = 'ou=bodies, ' + ldap_top_dn;
    var filter = '(&(objectClass=aegeeBodyFab)(bodyCategory=Local))';

    ldap.searchLDAP(filter, searchDN, res);
};

//v0.1.0 - remember to bump version numbers
exports.findAntenna = function(req, res , next) {
    req.log.debug({req: req}, 'findAntenna request');
    res.setHeader('Access-Control-Allow-Origin', '*');

    var searchDN = 'ou=bodies, ' + ldap_top_dn;
    var filter = '(&(bodyCode=' + req.params.bodyCode + ')(objectClass=aegeeBodyFab))';

    ldap.searchLDAP(filter, searchDN, res);
};

//v0.0.7 - remember to bump version numbers
exports.createUser = function(req, res , next) {
    req.log.debug({req: req}, 'createUser request');
    res.setHeader('Access-Control-Allow-Origin', '*');

    var baseDN = 'ou=people, ' + ldap_top_dn;

    var entry = {
      sn: req.params.sn,
      givenName: req.params.givenName,
      cn: req.params.cn,
      uid: req.params.givenName + '.' + req.params.sn, //TODO: check clashes between existing UIDs  (#2)
      mail: req.params.mail,
      userPassword: req.params.userPassword,
      birthDate: req.params.birthDate,
      objectclass: 'aegeePersonFab'
    };

    ldap.addEntry(entry, 'uid=' + entry.uid + ',' + baseDN,
     res,
     emailtriggers.onUserCreation); 

    //the response is sent after addEntry, so that 
    //in case of failure the user knows

    //TRIGGER: apply to body registered with
    //TRIGGER: create user in O365
};

//v0.0.7 - remember to bump version numbers
exports.createAntenna = function(req, res , next) {
    req.log.debug({req: req}, 'createAntenna request');
    res.setHeader('Access-Control-Allow-Origin', '*');

    var baseDN = 'ou=bodies, ' + ldap_top_dn;

    var entry = {
      bodyCategory: req.params.bodyCategory,
      bodyCode: req.params.bodyCode, //TODO: check clashes between existing UIDs
      bodyNameAscii: req.params.bodyNameAscii,
      mail: req.params.mail,
      netcom: req.params.netcom,
      bodyStatus: 'C',                //if newly created, automatically is Contact
      objectclass: 'aegeeBodyFab'
    };


    ldap.addEntry(entry, 'bodyCode=' + entry.bodyCode + ',' + baseDN,
     res,
     emailtriggers.onBodyCreation);

    //the response is sent after addEntry, so that 
    //in case of failure the user knows

    //TRIGGER: create local groups (e.g. board) entries

};

//v0.0.7 - remember to bump version numbers
exports.createApplication = function(req, res , next) { 
    req.log.debug({req: req}, 'createApplication request');
    res.setHeader('Access-Control-Allow-Origin', '*');

    var baseDN = 'uid=' + req.params.userId + ', ou=people, ' + ldap_top_dn;

    //TODO: check if UID already existing

    var entry = {
      bodyCategory: req.params.bodyCategory,
      bodyCode: req.params.bodyCode, //TODO: check clashes between existing UIDs (#2)
      bodyNameAscii: req.params.bodyNameAscii,
      mail: req.params.mail,
      uid: req.params.uid,
      cn: req.params.cn,
      memberSinceDate: req.params.memberSinceDate,
      memberUntilDate: req.params.memberUntilDate,
      memberType: 'Applicant',
      objectclass: 'aegeePersonMembership'
    };

    ldap.addEntry(entry, 'bodyCode=' + entry.bodyCode + ',' + baseDN,
     res, 
     emailtriggers.onApplicationCreation);

    //the response is sent after addEntry, so that 
    //in case of failure the user knows

};

//v0.0.9 - remember to bump version numbers
exports.modifyMembership = function(req, res , next) {
    req.log.debug({req: req}, 'modifyMembership request');
    res.setHeader('Access-Control-Allow-Origin', '*');

    var baseDN = 'bodyCode=' + req.params.bodyCode + ',uid=' + req.params.userId + ', ou=people, ' + ldap_top_dn;
    var searchDN = 'uid=' + req.params.userId + ',ou=people, ' + ldap_top_dn;
    var filter = '(&(bodyCode=' + req.params.bodyCode + ')(objectClass=aegeePersonMembership))';

    ldap.modifyMembership(baseDN, 
      req.params.memberType, 
      emailtriggers.onMembershipModification.bind(filter,searchDN,res) );

    //TODO: membership should begin from acceptance date, not from application date (maybe)
    
};


//HELPER or INTERNAL METHODS/VARS

//v0.1.0
function generateToken(res, user){ 

  user = user[0]; //The query always returns an array

  var token = jwt.sign(user, config.secret);

  //after all is well, before returning the token 
  // re-bind with privileged user
  ldap.bindSuper(function(err) { 
      log.info({err: err}, 'LDAP client binding SU after generating token');
      assert.ifError(err);

      // return the information including token as JSON
      res.json({
        success: true,
        message: 'Enjoy your token!',
        token: token    
      });
    });

};


var emailtriggers = {//NOTE: the response is called resp because
                    // res is the result of the ldapjs operations

  //v0.1.0
  onUserCreation: function mailToUser(err, entry, resp){
    log.info({entry: entry, err: err}, 'Adding %s user', entry.objectclass);
    
    if(err === null){

      //send mail accordingly
      var mailmessage = { }; //default values are welcome email

      mail.sendMail(mailmessage, entry);

      resp.send(201, entry);

    }else{
      assert.ifError(err);
    }

  },

  //TODO
  onBodyCreation: function mailToCDAndContact(err, entry, resp){
    log.info({entry: entry, err: err}, 'Adding %s body', entry.objectclass);
    
    if(err === null){
      resp.send(201, entry);
    }else{
      assert.ifError(err);
    }
  },

  //v0.1.0
  onApplicationCreation: function mailToUserAndBoardiesForCreation(err, entry, resp){
    log.info({entry: entry, err: err}, 'Adding %s application', entry.objectclass);
    
    if(err === null){

      //send mail accordingly
      var mailmessage = { 
        subject: "Your application to "+entry.bodyNameAscii,
        content: "Hi {{name}}, \n your application to the body has been received!"
      };

      //alert USER via email
      mail.sendMail(mailmessage, entry);

      var boardUser = {
        cn: 'boardies',
        mail: entry.bodyCode+"@aegee.org" //FIXME assumes every body has alias of code
      };

      mailmessage = {
        subject: "New applicant to "+entry.bodyNameAscii,
        content: "Hi {{name}}, \n you have a new application to the body, by "+entry.uid
       };

      //alert BOARD via email
      mail.sendMail(mailmessage, boardUser);

      resp.send(201, entry);
    }else{
      assert.ifError(err);
    }
  },

  //v0.1.0
  onMembershipModification: function mailToUserAndBoardiesForMod(err, filter, searchDN, resp) {
      
      ldap.searchLDAP(filter,searchDN,resp, function(resp, data){

          //send mail to USER
          var mailmessage = {
             subject: "Your membership has changed",
             content:    "Hi {{name}}, \n your membership has changed to "+data[0].memberType
          };
          mail.sendMail(mailmessage, data[0]);

          //send mail to BOARD
          mailmessage = {
             subject: "Membership of "+data[0].cn+" has changed",
             content: "Hi {{name}}, \n the member status of "+data[0].cn+" has changed to "+data[0].memberType
          };
          var boardUser = {
            cn: 'boardies',
            mail: data[0].bodyCode+'@aegee.org'
          }
          mail.sendMail(mailmessage, boardUser);

          //send a response
          resp.send(200, data);
        });
    }
  
}

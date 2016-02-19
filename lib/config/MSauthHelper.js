// Thanks to Microsoft. From github.com/OfficeDev/
var AuthenticationContext = require("adal-node").AuthenticationContext;

var config = require('./config.json');
var log = require('./logger');


var TOKEN_CACHE_KEY = null;
var TOKEN_EXPIRE_ON = null;


//following the "client application" grant flow 
//https://msdn.microsoft.com/en-us/library/azure/dn645543.aspx
function authenticate(next){

  if (next === undefined){ next = function(obj){}; }

  var authorityHostUrl = config.grant_flow.authorityHostUrl;
  var tenant = config.grant_flow.application_id;
  var authorityUrl = authorityHostUrl + '/' + tenant;
  var clientId = config.grant_flow.client_id;
  var clientSecret = config.grant_flow.client_secret;
  var resource = config.grant_flow.resource;

  var context = new AuthenticationContext(authorityUrl);

  context.acquireTokenWithClientCredentials(resource, clientId, clientSecret, function(err, tokenResponse) {
    if (err) {
      console.log("well that didn't work: " + err.stack);
      return next(null);
    } else {
      TOKEN_CACHE_KEY = tokenResponse.accessToken;
      TOKEN_EXPIRE_ON = tokenResponse.expiresOn;
      console.log(TOKEN_EXPIRE_ON);
      exports.OAuthToken = TOKEN_CACHE_KEY;
      return next(TOKEN_CACHE_KEY);
    }
  });

};

function checkIfTokenExpired(token, callback) {
    //var time = Math.floor(Date.now() / 1000);
    //if( aTOKEN_EXPIRE_ON - time < 100){
    if( new Date(TOKEN_EXPIRE_ON) - new Date() < 10000){ //100 seconds
      console.log("Requesting another token: less than 100s to expiration");
      return authenticate(callback);
    }
    return callback(token);
};

exports.authenticate = authenticate;
exports.checkIfTokenExpired = checkIfTokenExpired;

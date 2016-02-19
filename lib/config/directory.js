
var config = require('./config.json');
var log = require('./logger');

var authHelper = require('./MSauthHelper.js');

var restify = require('restify');
var restClient = restify.createJsonClient({
  url: 'https://graph.microsoft.com'
});



function addMemberToO365(userObject, OAuthToken, res) {

  wrapRequestAsCallback(OAuthToken, {

    onSuccess: function (token) {
      // send the mail with a callback and report back that page...
      //var postBody = generatePOSTBody(displayName, destinationEmailAddress);
      var postBody = {
        accountEnabled: true,
        displayName: userObject.fullName,
        userPrincipalName: userObject.uid+"@aegee.eu",
        passwordProfile: userObject.password
        //mailNickname: ?????????
      }
      postData('/v1.0/users/'
        , token
        , postBody
        , function (result) {
            console.log("Create user status code: " + result.statusCode);
            if (result.statusCode >= 400) {
              //HANDLE ERROR
              return res.send("error >= 400");
            }
            if (result.statusCode !== 201) {
              //HANDLE ERROR
              return res.send("error !== 201");
            }
            return res.send("mail sent");
        });
    },

    onFailure: function (err) {
      res.status(err.code);
      console.log(err.message);
      res.send();
    }
  });
};

//INTERNAL
function wrapRequestAsCallback(tokenKey, callback) {
  authHelper.checkIfTokenExpired(
     tokenKey
    , function (token) {
    if (token !== null) {
      callback.onSuccess(token);
    } else {
      callback.onFailure({
        code: 500,
        message: "An unexpected error was encountered acquiring access token from refresh token"
      });
    }
  });
}


function postData(path, token, postData, callback) {
  var outHeaders = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token,
    'Content-Length': JSON.stringify(postData).length
  };
  var options = {
    path: path,
    headers: outHeaders
  };
  
  restClient.post(options, postData, function(err,req,res,obj){
    if(err!=null){
      return callback(err);
    }
    console.log(res.statusCode);
    console.log(res.statusMessage);
    return callback(res);
  });
  
};
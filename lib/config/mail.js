
var config = require('./config.json');
var log = require('./logger');

var authHelper = require('./MSauthHelper.js');

var restify = require('restify');
var restClient = restify.createJsonClient({
  url: 'https://graph.microsoft.com'
});

//USER FORMAT:
//Must have a property "cn" and "mail"

//MESSAGE FORMAT:
//Already pre-formatted in emailContent and emailSubject
//Can be overridden (each of them individually) by passing 
//a message object with the properties "subject" and "content"

//v0.1.0
exports.sendMail = function(message, user){
  console.log("message to be sent");

  console.log(message);

  //MODIFY emailContent WITH message
  if( message.subject ){
    emailSubject = message.subject;
  }else{
    emailSubject = defaultEmailSubject;
  }
  if( message.content ){
    emailContent = message.content;
  }else{
    emailContent = defaultEmailContent;
  }

  sendMailWithGraph(user, authHelper.OAuthToken);
}

//INTERNAL or helper methods and variables

// The contents of the outbound email message that will be sent to the user
var defaultEmailContent = "<html><head> <meta http-equiv=\'Content-Type\' content=\'text/html; charset=us-ascii\'> <title></title> </head><body style=\'font-family:calibri\'> <p>Hi {{name}},</p> <p>You have successfully registered to MyAEGEE. </p> <h3>What&#8217;s next?</h3> <ul><li>Check out <a href=\'http://aegee.eu\' target=\'_blank\'>aegee.eu</a> to start your awesome adventure.</li><li>Head over to the <a href=\'http://aegee.org/portal\' target=\'blank\'>Summer University</a> to explore the Most famous programme.</li><li>Browse our <a href=\'https://github.com/AEGEE/\' target=\'_blank\'>code on GitHub</a> to see how you can improve things you don't like.</li></ul> <h3>Give us feedback</h3> <ul><li>If you have any trouble running this sample, please <a href=\'\' target=\'_blank\'>log an issue</a>.</li><li>For general questions about the product, mail to <a href=\'http://stackoverflow.com/\' target=\'blank\'>membership-system-l</a>. Make sure that your questions or comments are clear!.</li></ul><p>Thanks and have fun!<br>Your development team </p> <div style=\'text-align:center; font-family:calibri\'> <table style=\'width:100%; font-family:calibri\'> <tbody> <tr> <td><a href=\'https://github.com/OfficeDev/O365-Nodejs-Microsoft-Graph-Connect\'>See on GitHub</a> </td> <td><a href=\'https://officespdev.uservoice.com/forums/224641-general/category/72301-documentation-guidance\'>Suggest on UserVoice</a> </td> <td><a href=\'http://twitter.com/share?text=I%20just%20started%20developing%20apps%20for%20%23Node.js%20using%20the%20%23Office365%20Connect%20app%20%40OfficeDev&amp;url=https://github.com/OfficeDev/O365-Nodejs-Microsoft-Graph-Connect\'>Share on Twitter</a> </td> </tr> </tbody> </table> </div>  </body> </html>";
var defaultEmailSubject = "Welcome to AEGEE!";
var emailContent = defaultEmailContent;
var emailSubject = defaultEmailSubject;

function getEmailContent(name) {
  return emailContent.replace("{{name}}", name);
}

function wrapEmail(content, recipient) {
  var emailAsPayload = {
    Message: {
      Subject: emailSubject,
      Body: {
        ContentType: 'HTML',
        Content: content
      },
      ToRecipients: [
        {
          EmailAddress: {
            Address: recipient
          }
        }
      ]
    },
    SaveToSentItems: true
  };
  return emailAsPayload;
}

//this body is in a format good for POST transmission
function generatePOSTBody(name, recipient) {
  return wrapEmail(getEmailContent(name), recipient);
}

function sendMailWithGraph(userObject, OAuthToken) {

var destinationEmailAddress= userObject.mail;
var displayName = userObject.cn;

  wrapRequestAsCallback(OAuthToken, {

    onSuccess: function (token) {
      // send the mail with a callback and report back that page...
      var postBody = generatePOSTBody(displayName, destinationEmailAddress);
      postData('/v1.0/users/noreply@aegee.eu/microsoft.graph.sendMail'
        , token
        , postBody
        , function (result) {
            console.log("Send mail status code: " + result.statusCode);
            //console.log("\n\ntoken: " + token);
            if (result.statusCode >= 400) {
              //HANDLE ERROR
              return console.log("error >= 400");
            }
            if (result.statusCode !== 202) {
              //HANDLE ERROR
              return console.log("error !== 202");
            }
            return console.log("mail sent");
        });
    },

    onFailure: function (err) { 
      console.log(err.code, err.message);
    }
  });
};

function wrapRequestAsCallback(tokenKey, callback) {
  authHelper.checkIfTokenExpired(
     tokenKey
    , function (token) {
    if (token !== null) {
      callback.onSuccess(token);
    } else {
      callback.onFailure({
        code: 500,
        message: "An unexpected error was encountered acquiring access token after expiration"
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
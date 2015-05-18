
var restify = require('restify');
var core = require('./core'); //the real place where the API callbacks are
 
var port    =  '8080';
 
var server = restify.createServer({
    name : "calaf"
});

server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.CORS());
 

//Define your API here
var userPath = '/users'
server.get({path : userPath , version : '0.0.1'} , core.findAllUsers);
//server.get({path : userPath +'/:userId' , version : '0.0.1'} , findUser);


server.listen(port , function(){
    console.log('%s listening at %s ', server.name , server.url);
});
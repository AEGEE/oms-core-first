
var restify = require('restify');
var core = require('./core'); //the real place where the API callbacks are

var config = require('config.json')();

var server = restify.createServer({
    name : "calaf"
});

server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.CORS());


//Define your API here
var userPath = '/users';
server.get({path : userPath , version : '0.0.1'} , core.findAllUsers);
server.get({path : userPath +'/:userId' , version : '0.0.1'} , core.findUser);
//sorted by user (given user, to what applied/member)
server.get({path : userPath +'/:userId'+'/memberships' , version : '0.0.1'} , core.findMemberships);
server.get({path : userPath +'/:userId'+'/applications' , version : '0.0.1'} , FIXME);
//end
server.post({path : userPath +'/create' , version : '0.0.1'} , core.createUser);
server.post({path : userPath +'/:userId'+'/memberships/create' , version : '0.0.1'} , core.createApplication);
server.post({path : userPath +'/:userId'+'/memberships/:bodyCode/modify' , version : '0.0.1'} , core.modifyMembership);

var bodiesPath = '/bodies'; 
//sorted by antenna (given antenna, who is member/applied)
server.get({path : bodiesPath +'/:bodyCode'+'/applications' , version : '0.0.1'} , core.findApplications);
server.get({path : bodiesPath +'/:bodyCode'+'/members' , version : '0.0.1'} , FIXME);
//end

var antennaePath = '/antennae';
server.get({path : antennaePath , version : '0.0.1'} , core.findAllAntennae);
server.get({path : antennaePath +'/:bodyCode' , version : '0.0.1'} , core.findAntenna);
server.post({path : antennaePath +'/create' , version : '0.0.1'} , core.createAntenna);


server.listen(config.port, function(){
    console.log('%s listening at %s ', server.name , server.url);
});

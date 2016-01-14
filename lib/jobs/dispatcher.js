//this file sets the timers, the functions triggered are 
//defined in another file


var config = require('../config/config.json');

var Agenda = require('agenda');
var agenda = new Agenda({db: {address: config.mongo.url}});

require('./memberships.js')(agenda)

agenda.on('ready', function() {

  // Every day at 2.30am check for membership expiration
  agenda.every('30 2 * * *', 'Check membership expiration');

  // Every 9th day of month at 3.30am take a "snapshot" of the members list for every local
  //agenda.every('30 3 9 * *', 'Snapshot members list');

  // Every 8th day of month at 3.30am check for membership deletion
  //agenda.every('30 3 8 * *', 'Check membership for deletion');

  agenda.start();
});

//module.exports = agenda;


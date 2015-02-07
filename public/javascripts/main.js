var riot = require('riot');
var riotControl = require('./lib/riot-control');

var doctorsList = require('./stores/doctors')();
var doctor = require('./stores/doctor')();

riotControl.addStore(doctorsList);
riotControl.addStore(doctor);

require('./tags/app.tag');
require('./tags/splash.tag');
require('./tags/map.tag');
require('./tags/doctor.tag');

riot.mount('dwm-app');

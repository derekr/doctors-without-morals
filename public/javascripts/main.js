Parse.initialize("u5GYkgHb3xvWHgEclLEq9Vsa4DzbcQyhuHzSy4KT", "cV86IvpB4YVDDl0vZjTwScFoH3bpYKq0B8uXJcat");

var riot = require('riot');
var riotControl = require('./lib/riot-control');

var doctorsList = require('./stores/doctors')();
var doctor = require('./stores/doctor')();
var map = require('./stores/map')();

riotControl.addStore(doctorsList);
riotControl.addStore(doctor);
riotControl.addStore(map); // keeps track of tab bar filter

require('./tags/app.tag');
require('./tags/splash.tag');
require('./tags/map.tag');
require('./tags/tab-bar.tag');
require('./tags/doctor.tag');

riot.mount('dwm-app');



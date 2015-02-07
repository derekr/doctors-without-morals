var riot = require('riot');
var riotControl = require('./lib/riot-control');

var doctorsList = require('./stores/doctors')();

riotControl.addStore(doctorsList);

require('./tags/app.tag');
require('./tags/splash.tag');
require('./tags/map.tag');

riot.mount('dwm-app');

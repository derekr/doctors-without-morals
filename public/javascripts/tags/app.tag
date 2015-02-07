<dwm-app>
    <dwm-splash></dwm-splash>
    <dwm-map></dwm-map>
    <dwm-tab-bar></dwm-tab-bar>
    <dwm-doctor></dwm-doctor>

    var riotControl = require('../lib/riot-control');

    var self = this;

    self.on('mount', function() {
        setTimeout(function () {
            console.log('app loaded');
            riotControl.trigger('appLoaded');
            riotControl.trigger('doctorsListInit');
        }, 2000);
    });
</dwm-app>

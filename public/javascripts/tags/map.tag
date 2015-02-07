<dwm-map>
    <div class="map-view { 'is-hidden': isHidden }">
        <div id="map-container"></div>
    </div>

    var MAPBOX_ID = 'drkchd7.l5afb5b5';
    var MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiZHJrY2hkNyIsImEiOiJReEVFQjhZIn0.sEf0nefefS_fxgRl8VfmWw';

    var riotControl = require('../lib/riot-control');

    var self = this;

    self.doctors = [];

    self.isHidden = true;

    riotControl.on('doctorsListChanged', function (doctors) {
        self.isHidden = false;
        self.doctors = doctors;
        self.update();
    });

    self.on('mount', function () {
        self.map = L.mapbox.map(self['map-container'], MAPBOX_ID, {
            accessToken: MAPBOX_ACCESS_TOKEN
        });

        var geocode = L.mapbox.geocoder('mapbox.places', {
            accessToken: MAPBOX_ACCESS_TOKEN
        });

        geocode.query('San Francisco, CA', function (err, result) {
            self.map.setView([result.latlng[0], result.latlng[1]], 12);
        });

        self.map.eachLayer(function (layer) {
            layer.on('click', function () {
                riotControl.trigger('doctorInit', {});
            });
        })
    });
</dwm-map>

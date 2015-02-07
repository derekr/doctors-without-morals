<dwm-map>
    <div class="map-view { 'is-hidden': isHidden }">
    <ul class="doctors-list">
        <li each={ doctors }>
            { name }
        </li>
    </ul>

    <p>
        the data for this list comes from `stores/doctors.js` which can be
        populated from parse.io.
    </p>
    </div>

    var riotControl = require('../lib/riot-control');

    var self = this;

    self.doctors = [];

    self.isHidden = true;

    riotControl.on('doctorsListChanged', function (doctors) {
        self.isHidden = false;
        self.doctors = doctors;
        self.update();
    });
</dwm-map>

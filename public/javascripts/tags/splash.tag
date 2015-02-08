<dwm-splash>
    <div class="splash-view { 'is-hidden': isHidden }">
        <h1>Doctors Without Morals</h1>

        <p>
            🌿💊💉🚀🔪
        </p>
    </div>

    var riotControl = require('../lib/riot-control');

    var self = this;

    self.isHidden = false;

    riotControl.on('doctorsListChanged', function (doctors) {
        console.log('list changed');
        self.isHidden = true;
        self.update();
    });
</dwm-splash>

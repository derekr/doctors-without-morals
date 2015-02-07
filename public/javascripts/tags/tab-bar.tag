<dwm-tab-bar>
    <div class="tab-bar-view { 'is-hidden': isHidden }">
        <div class="tab-nav">
            <div data-filter="herb" onclick={ tab }>
                🌿
            </div>
            <div data-filter="pills" onclick={ tab }>
                💊
            </div>
            <div data-filter="lucky" onclick={ tab }>
                🚀
            </div>
            <div data-filter="desperate" onclick={ tab }>
                🔪
            </div>
        </div>
    </div>

    var riotControl = require('../lib/riot-control');

    var self = this;

    self.isHidden = true;

    riotControl.on('doctorsListChanged', function () {
        self.isHidden = false;
        self.update();
    });

    tab (e) {
        var target = e.target;
        riotControl.trigger('filterMap', target.dataset.filter);
    }
</dwm-tab-bar>

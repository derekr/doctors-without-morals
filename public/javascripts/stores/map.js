var riot = require('riot');

module.exports = Map;

function Map () {
    if (!(this instanceof Map)) return new Map();

    riot.observable(this);

    var self = this;

    self.filter = null;

    self.on('filterMap', function (filter) {
        self.filter = filter;
        self.trigger('mapFilterChanged', self.filter);
    });
};

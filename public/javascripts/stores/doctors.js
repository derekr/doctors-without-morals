var riot = require('riot');

module.exports = Doctors;

function Doctors () {
    if (!(this instanceof Doctors)) return new Doctors();

    riot.observable(this);

    var self = this;

    self.doctors = [{ name: 'doc1' }, { name: 'doc2' }];

    self.on('doctorsListInit', function() {
        self.trigger('doctorsListChanged', self.doctors);
    });
};

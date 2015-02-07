var riot = require('riot');

module.exports = Doctor;

function Doctor () {
    if (!(this instanceof Doctor)) return new Doctor();

    riot.observable(this);

    var self = this;

    self.doctor = null;

    self.on('doctorInit', function (id) {
        self.doctor = { name: 'doc1' };
        console.log('init doctor');
        self.trigger('doctorChanged', self.doctor);
    });

    self.on('doctorDismiss', function () {
        self.doctor = null;
        self.trigger('doctorChanged', self.doctor);
    });
};

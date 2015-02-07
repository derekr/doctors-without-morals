var riot = require('riot');

module.exports = Doctor;

function Doctor () {
    if (!(this instanceof Doctor)) return new Doctor();

    riot.observable(this);

    var self = this;

    self.doctor = null;

    self.on('doctorInit', function (dr) {
        self.doctor = dr;
        console.log('init doctor, dr: ' + JSON.stringify(dr));
        self.trigger('doctorChanged', self.doctor);
    });

    self.on('doctorDismiss', function () {
        self.doctor = null;
        self.trigger('doctorChanged', self.doctor);
    });
};

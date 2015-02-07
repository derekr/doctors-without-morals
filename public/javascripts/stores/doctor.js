var riot = require('riot');

module.exports = Doctor;

function Doctor () {
    if (!(this instanceof Doctor)) return new Doctor();

    riot.observable(this);

    var self = this;

    self.doctor = null;

    self.on('doctorInit', function (id) {
        self.doctor = {
            name: 'Leo Spaceman',
            rating: 3,
            drugs: 'weed, vicodin',
            instructions: 'Tell Dr Spaceman you have a constant pressure behind your right eye.',
            avatar: 'https://pbs.twimg.com/profile_images/1008791271/leospaceman_400x400.jpg',
            cover: 'http://distancecities.com/wp-content/uploads/2014/11/new_york_hop.jpg'
        };
        console.log('init doctor');
        self.trigger('doctorChanged', self.doctor);
    });

    self.on('doctorDismiss', function () {
        self.doctor = null;
        self.trigger('doctorChanged', self.doctor);
    });
};

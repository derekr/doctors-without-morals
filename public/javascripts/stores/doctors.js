var riot = require('riot');

module.exports = Doctors;

function Doctors () {
    if (!(this instanceof Doctors)) return new Doctors();

    riot.observable(this);

    var self = this;
    self.doctors = [];

    self.on('doctorsListInit', function() {
        var Doctor = Parse.Object.extend("doctor");
        var dr = new Doctor();
        var query = new Parse.Query(Doctor);
        query.find({
            success: function(results) {
                console.log('loaded doctors');
                for (var i = 0; i < results.length; i++) {
                    var dr = results[i];
                    console.log(dr.id + ' - ' + dr.get('name'));
                    self.doctors.push({
                        objectId: dr.get('objectId'),
                        name: dr.get('name'),
                        rating: dr.get('rating'),
                        drugs: dr.get('drugs'),
                        instructions: dr.get('instructions'),
                        avatar: dr.get('avatar'),
                        cover: dr.get('cover')
                    });
                }
                self.trigger('doctorsListChanged', self.doctors);
            },
            error: function(error) {
                alert("Error: " + error.code + " " + error.message);
            }
        });

        self.trigger('doctorsListChanged', self.doctors);
    });
};

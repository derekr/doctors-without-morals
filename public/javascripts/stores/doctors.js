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
                for (var i = 0; i < results.length; i++) {
                    var dr = results[i];
                    self.doctors.push({
                        objectId: dr.get('objectId'),
                        name: dr.get('name'),
                        rating: dr.get('rating'),
                        drugs: dr.get('drugs'),
                        instructions: dr.get('instructions'),
                        avatar: dr.get('avatar'),
                        cover: dr.get('cover'),
                        comment1: dr.get('Comment_1'),
                        comment2: dr.get('Comment_2'),
                        comment3: dr.get('Comment_3'),
                        profileNumber: dr.get('Profile_Number'),
                        incarcerated: dr.get('Incarcerated')
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

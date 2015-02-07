<dwm-doctor>
    <div class="doctor-view { 'is-hidden': isHidden }">
        <div class="modal-box { 'is-hidden': !showModal }">
            { doctor.name }
        </div>
        <div class="modal-overlay" onclick={ dismiss }></div>
    </div>

    var riotControl = require('../lib/riot-control');

    var self = this;

    self.isHidden = true;
    self.showModal = false;
    self.doctor = {};

    riotControl.on('doctorChanged', function (doctor) {
        console.log('doctor changed');
        if (doctor === null) {
            self.showModal = false;
            self.update();

            setTimeout(function () {
                self.isHidden = true;
                self.doctor = {};
                self.update();
            }, 80);

            return;
        }

        self.isHidden = false;
        self.doctor = doctor;
        self.update();
        setTimeout(function () {
            self.showModal = true;
            self.update();
        }, 20);
    });

    dismiss (e) {
        riotControl.trigger('doctorDismiss');
    }
</dwm-doctor>

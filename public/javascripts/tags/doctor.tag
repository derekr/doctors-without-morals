<dwm-doctor>
    <div class="doctor-view { 'is-hidden': isHidden }">
        <div class="modal-box { 'is-hidden': !showModal }">
            <div class="modal-header" style="background-image: url({ doctor.cover })">
                <div class="modal-avatar" style="background-image: url({ doctor.avatar })"></div>
            </div>

            <div class="modal-body">
                <ul>
                    <li>Name: { doctor.name }</li>
                    <li>Drugs: { doctor.drugs }</li>
                    <li>Rating: { doctor.rating }</li>
                </ul>

                <div class="modal-highlight">
                    { doctor.instructions }
                </div>
            </div>
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

<dwm-doctor>
    <div class="doctor-view { 'is-hidden': isHidden }">
        <div class="modal-box { 'is-hidden': !showModal }">
            <div class="modal-header" style="background-image: url({ doctor.cover })">
                <div class="modal-avatar" style="background-image: url({ doctor.avatar })"></div>
                <div class="doctor-info">
                    <span class="doctor-name">{ doctor.name }</span>
                </div>
            </div>

            <div class="modal-body">
                <ul>
                    <li>Drugs: { doctor.drugs }</li>
                    <li>Rating: { doctor.rating }</li>
                </ul>

                <div class="modal-highlight">
                    { doctor.instructions }
                </div>
            </div>

            <button class="booking-btn { 'btn-success': isBooked }" onclick={ book }>
                <span if={ !isBooked }>
                    {
                        typeof doctor.incarcerated !== 'undefined' ?
                            'Donate to Legal Fund' :
                            'Book Appointment'
                    }
                </span>
                <span if={ isBooked }>
                    Chilllll! 👍
                </span>
            </button>
        </div>
        <div class="modal-overlay" onclick={ dismiss }></div>
    </div>

    var riotControl = require('../lib/riot-control');

    var self = this;

    self.isHidden = true;
    self.showModal = false;
    self.isBooked = false;
    self.doctor = {};

    riotControl.on('doctorChanged', function (doctor) {
        console.log('doctor changed');
        if (doctor === null) {
            self.showModal = false;
            self.update();

            setTimeout(function () {
                self.isHidden = true;
                self.doctor = {};
                self.isBooked = false;
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

    book (e) {
        self.isBooked = true;
        self.update();
    }
</dwm-doctor>

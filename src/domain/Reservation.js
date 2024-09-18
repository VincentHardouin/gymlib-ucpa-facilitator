const STATES = {
  DEFAULT: 'no-handled',
  NO_HANDLED: 'no-handled',
  FORM_SUBMITTED: 'form-submitted',
  FORM_ERROR: 'form-error',
  UCPA_VALIDATED: 'validated',
  COMPLETED: 'completed',
};

class Reservation {
  constructor(code, state) {
    this.state = state;
  }
}

Reservation.STATES = STATES;

export { Reservation };

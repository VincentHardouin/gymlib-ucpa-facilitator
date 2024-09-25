const STATUSES = {
  DEFAULT: 'no-handled',
  NO_HANDLED: 'no-handled',
  FORM_SUBMITTED: 'form-submitted',
  FORM_ERROR: 'form-error',
  UCPA_VALIDATED: 'validated',
  NOTIFIED: 'notified',
  RESERVED: 'reserved',
  COMPLETED: 'completed',
};

class Reservation {
  constructor({ code, status, start, court, activity, updatedAt }) {
    this.code = code;
    this.status = status;
    this.start = start;
    this.court = court;
    this.activity = activity;
    this.updatedAt = updatedAt;
  }

  static createFromCode(code) {
    return new Reservation({ code, status: Reservation.STATUSES.DEFAULT });
  }

  get isNotHandled() {
    return [STATUSES.DEFAULT, STATUSES.NO_HANDLED, STATUSES.FORM_ERROR].includes(this.status);
  }

  get isRequiresValidation() {
    return this.status === STATUSES.FORM_SUBMITTED;
  }

  get isValidated() {
    return this.status === STATUSES.UCPA_VALIDATED;
  }

  markAsSubmitted() {
    this.status = Reservation.STATUSES.FORM_SUBMITTED;
    this.updatedAt = new Date();
  }

  markAsValidated() {
    this.status = Reservation.STATUSES.UCPA_VALIDATED;
    this.updatedAt = new Date();
  }

  markAsNotified() {
    this.status = Reservation.STATUSES.NOTIFIED;
    this.updatedAt = new Date();
  }

  markAsReserved({ start, court, activity }) {
    this.start = start;
    this.court = court;
    this.activity = activity;
    this.status = Reservation.STATUSES.RESERVED;
    this.updatedAt = new Date();
  }
}

Reservation.STATUSES = STATUSES;

export { Reservation };

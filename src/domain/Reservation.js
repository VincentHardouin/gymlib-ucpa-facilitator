const STATUSES = {
  DEFAULT: 'no-handled',
  NO_HANDLED: 'no-handled',
  FORM_SUBMITTED: 'form-submitted',
  FORM_ERROR: 'form-error',
  UCPA_VALIDATED: 'validated',
  COMPLETED: 'completed',
};

class Reservation {
  constructor({ code, status, updatedAt }) {
    this.code = code;
    this.status = status;
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
  }

  markAsValidated() {
    this.status = Reservation.STATUSES.UCPA_VALIDATED;
  }

  markAsCompleted() {
    this.status = Reservation.STATUSES.COMPLETED;
  }
}

Reservation.STATUSES = STATUSES;

export { Reservation };

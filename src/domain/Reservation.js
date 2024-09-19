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

  get shouldSubmitForm() {
    return [STATUSES.DEFAULT, STATUSES.NO_HANDLED, STATUSES.FORM_ERROR].includes(this.status);
  }

  get shouldVerifyUCPAValidation() {
    return this.status === STATUSES.FORM_SUBMITTED;
  }

  get isValidated() {
    return this.status === STATUSES.UCPA_VALIDATED;
  }

  async submitForm() {
    throw new Error('not implemented yet');
  }

  async notify() {
    throw new Error('not implemented yet');
  }

  async verifyValidation() {
    throw new Error('not implemented yet');
  }
}

Reservation.STATUSES = STATUSES;

export { Reservation };

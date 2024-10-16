import { reservationRepository } from '../../infrastructure/repositories/ReservationRepository.js';
import { NotFoundError } from '../Errors.js';
import { Reservation } from '../Reservation.js';

const CODE_REGEXP = /Voici votre code de réservation UCPA : (?<code>\d+)/;

export class HandleNewReservationUseCase {
  constructor({ mailAdapter, searchQuery }) {
    this.mailAdapter = mailAdapter;
    this.searchQuery = searchQuery;
  }

  async execute() {
    const messages = await this.mailAdapter.fetch(this.searchQuery);
    for (const message of messages) {
      const code = this._getUCPAReservationCode(message);
      if (!code) {
        continue;
      }
      await this._createReservationIfNotExists(code);
    }
  }

  _getUCPAReservationCode(message) {
    const match = message.html.match(CODE_REGEXP);
    if (!match) {
      return null;
    }
    return match.groups.code;
  }

  async _createReservationIfNotExists(code) {
    try {
      await reservationRepository.get(code);
    }
    catch (e) {
      if (e instanceof NotFoundError) {
        const reservation = Reservation.createFromCode(code);
        await reservationRepository.save(reservation);
        return;
      }
      throw e;
    }
  }
}

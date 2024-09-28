import { reservationRepository } from '../../infrastructure/ReservationRepository.js';
import { NotFoundError } from '../NotFoundError.js';
import { Reservation } from '../Reservation.js';

const CODE_REGEXP = /Voici votre code de réservation UCPA : (?<code>\d+)/;

export class HandleNewReservationUseCase {
  constructor({ imapClient, searchQuery }) {
    this.imapClient = imapClient;
    this.searchQuery = searchQuery;
  }

  async execute() {
    const messages = await this.imapClient.fetch(this.searchQuery);
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

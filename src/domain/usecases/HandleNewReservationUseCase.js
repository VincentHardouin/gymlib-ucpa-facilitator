import { reservationRepositories } from '../../infrastructure/ReservationRepositories.js';
import { NotFoundError } from '../NotFoundError.js';
import { Reservation } from '../Reservation.js';

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
    const match = message.html.match(/Voici votre code de réservation UCPA : (?<code>\d+)/);
    if (!match) {
      return null;
    }
    return match.groups.code;
  }

  async _createReservationIfNotExists(code) {
    try {
      await reservationRepositories.get(code);
    }
    catch (e) {
      if (e instanceof NotFoundError) {
        const reservation = Reservation.createFromCode(code);
        await reservationRepositories.save(reservation);
        return;
      }
      throw e;
    }
  }
}

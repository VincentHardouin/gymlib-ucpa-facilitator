import { NotFoundError } from '../NotFoundError.js';
import { Reservation } from '../Reservation.js';

export class HandleScheduledReservationUseCase {
  constructor({ imapClient, searchQuery, reservationRepository }) {
    this.imapClient = imapClient;
    this.searchQuery = searchQuery;
    this.reservationRepository = reservationRepository;
  }

  async execute() {
    const messages = await this.imapClient.fetch(this.searchQuery);
    for (const message of messages) {
      const isScheduledReservationMessage = message.html.includes('MERCI POUR VOTRE RESERVATION !');
      if (!isScheduledReservationMessage) {
        continue;
      }
      const resaInformation = this._getInformation(message);
      const resa = await this._getReservationOrCreate(resaInformation.code);
      // here we don't check if it's already in reserved status, so we can change the slot.
      resa.markAsReserved({ start: resaInformation.start, court: resaInformation.court, activity: resaInformation.activity });
      await this.reservationRepository.save(resa);
    }
  }

  _getInformation(message) {
    const match = message.html.match(/Terrain (?<court>\d+) (?<activity>\w+)\s\w+ le (?<date>\d{2}-\d{2}-\d{4}) à (?<hour>\d{2}:\d{2})/);
    if (!match) {
      return null;
    }

    const matchCode = message.html.match(/<p>(?<code>\d+)<\/p>/);
    if (!matchCode) {
      return null;
    }

    const [day, month, year] = match.groups.date.split('-');
    const formattedDate = `${year}-${month}-${day}`;

    return {
      code: matchCode.groups.code,
      court: match.groups.court,
      activity: match.groups.activity,
      start: new Date(`${formattedDate}T${match.groups.hour}:00`),
    };
  }

  async _getReservationOrCreate(code) {
    try {
      return await this.reservationRepository.get(code);
    }
    catch (e) {
      if (e instanceof NotFoundError) {
        // We create a reservation in the event that not all the initial steps have been taken by this application.
        const reservation = Reservation.createFromCode(code);
        await this.reservationRepository.save(reservation);
        return reservation;
      }
      throw e;
    }
  }
}

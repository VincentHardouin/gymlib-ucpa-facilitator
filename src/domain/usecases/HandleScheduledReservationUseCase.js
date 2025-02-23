import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import { NotFoundError } from '../Errors.js';

import { Reservation } from '../Reservation.js';

dayjs.extend(utc);
dayjs.extend(timezone);

const RESERVATION_ACCEPTED_MESSAGE_CONTENT = 'MERCI POUR VOTRE RESERVATION !';
const EXTRACT_INFORMATION_REGEXP = /(?<court>\d+)?(?<activity>[a-zA-Z\s]+) le (?<date>\d{2}-\d{2}-\d{4}) à (?<hour>\d{2}:\d{2})/;
const EXTRACT_CODE_REGEXP = /<p>(?<code>\d+)<\/p>/;

export class HandleScheduledReservationUseCase {
  constructor({ mailAdapter, searchQuery, reservationRepository }) {
    this.mailAdapter = mailAdapter;
    this.searchQuery = searchQuery;
    this.reservationRepository = reservationRepository;
  }

  async execute() {
    const messages = await this.mailAdapter.fetch(this.searchQuery);
    for (const message of messages) {
      const isScheduledReservationMessage = message.html.includes(RESERVATION_ACCEPTED_MESSAGE_CONTENT);
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
    const match = message.html.match(EXTRACT_INFORMATION_REGEXP);
    if (!match) {
      return null;
    }

    const matchCode = message.html.match(EXTRACT_CODE_REGEXP);
    if (!matchCode) {
      return null;
    }

    const [day, month, year] = match.groups.date.split('-');
    const formattedDate = `${year}-${month}-${day}`;

    return {
      code: matchCode.groups.code,
      court: match.groups.court,
      activity: match.groups.activity.trim(),
      start: dayjs.tz(`${formattedDate}T${match.groups.hour}:00`, 'Europe/Paris'),
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

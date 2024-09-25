import { Reservation } from '../Reservation.js';
import { ReservationEvent } from '../ReservationEvent.js';

export class CreateReservationEventsUseCase {
  constructor({ reservationRepository, calendarRepository }) {
    this.reservationRepository = reservationRepository;
    this.calendarRepository = calendarRepository;
  }

  async execute() {
    const reservations = await this.reservationRepository.findByStatus(Reservation.STATUSES.RESERVED);
    const reservationEvents = this.calendarRepository.getAll();
    const reservationEventCodes = reservationEvents.map(({ code }) => code);
    const missingEvents = reservations
      .filter(({ code }) => !reservationEventCodes.includes(code))
      .map(reservation => ReservationEvent.fromReservation(reservation));

    for (const missingEvent of missingEvents) {
      this.calendarRepository.save(missingEvent);
    }
  }
}

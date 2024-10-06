import { Reservation } from '../Reservation.js';

export class HandleNextReservationUseCase {
  constructor({ reservationRepository, passRepository }) {
    this.reservationRepository = reservationRepository;
    this.passRepository = passRepository;
  }

  async execute() {
    const reservations = await this.reservationRepository.findByStatus(Reservation.STATUSES.RESERVED);
    const now = new Date();
    const nextReservations = reservations.filter(({ start }) => now < start);
    const nextReservation = nextReservations.sort((reservationA, reservationB) => reservationA.start - reservationB.start)[0];
    await this.passRepository.updateAll({ nextEvent: nextReservation.code });
  }
}

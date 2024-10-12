import { Reservation } from '../Reservation.js';

export class HandleNextReservationUseCase {
  constructor({ reservationRepository, passRepository, deviceRepository, notificationAdapter }) {
    this.reservationRepository = reservationRepository;
    this.passRepository = passRepository;
    this.deviceRepository = deviceRepository;
    this.notificationAdapter = notificationAdapter;
  }

  async execute() {
    const reservations = await this.reservationRepository.findByStatus(Reservation.STATUSES.RESERVED);
    const now = new Date();
    const nextReservations = reservations.filter(({ start }) => now < start);
    const nextReservation = nextReservations.sort((reservationA, reservationB) => reservationA.start - reservationB.start)[0];
    const passes = await this.passRepository.findAll();
    const updatedPasses = [];
    for (const pass of passes) {
      if (pass.nextEvent !== nextReservation.code) {
        continue;
      }

      await this.passRepository.update({ ...pass, nextEvent: nextReservation.code, updated_at: now });
      updatedPasses.push(pass);
    }

    const devicesToNotify = await this.deviceRepository.findByPasses(updatedPasses);
    for (const device of devicesToNotify) {
      await this.notificationAdapter.notify(device.pushToken);
    }
  }
}

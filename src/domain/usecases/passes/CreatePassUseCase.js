import { randomUUID } from 'node:crypto';
import { NotFoundError, UnableToCreatePassError } from '../../Errors.js';
import { ReservationPass } from '../../ReservationPass.js';

export class CreatePassUseCase {
  constructor({ passRepository, reservationRepository, config }) {
    this.passRepository = passRepository;
    this.reservationRepository = reservationRepository;
    this.config = config;
  }

  async execute() {
    try {
      const reservation = await this.reservationRepository.getNextEvent();
      const serialNumber = randomUUID();
      const passTypeIdentifier = this.config.passTypeIdentifier;
      await this.passRepository.save({ passTypeIdentifier, serialNumber, nextEvent: reservation.code });
      return new ReservationPass({ ...reservation, passTypeIdentifier, serialNumber });
    }
    catch (e) {
      if (e instanceof NotFoundError) {
        throw new UnableToCreatePassError();
      }
      throw e;
    }
  }
}

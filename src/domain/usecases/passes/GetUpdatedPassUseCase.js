import { ReservationPass } from '../../ReservationPass.js';

export class GetUpdatedPassUseCase {
  constructor({ reservationRepository, passRepository }) {
    this.reservationRepository = reservationRepository;
    this.passRepository = passRepository;
  }

  async execute({ passTypeIdentifier, serialNumber }) {
    const { nextEvent } = await this.passRepository.get({ passTypeIdentifier, serialNumber });
    const reservation = await this.reservationRepository.get(nextEvent);
    return new ReservationPass({ ...reservation, passTypeIdentifier, serialNumber });
  }
}

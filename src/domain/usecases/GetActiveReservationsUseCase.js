export class GetActiveReservationsUseCase {
  constructor({ reservationRepository }) {
    this.reservationRepository = reservationRepository;
  }

  async execute() {
    return this.reservationRepository.getActiveReservations();
  }
}

export class GetActiveReservationsUseCase {
  constructor({ reservationRepositories }) {
    this.reservationRepositories = reservationRepositories;
  }

  async execute() {
    return this.reservationRepositories.getActiveReservations();
  }
}

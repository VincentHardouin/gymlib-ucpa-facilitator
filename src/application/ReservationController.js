export class ReservationController {
  constructor({ handleNewReservationUseCase, getActiveReservationsUseCase, submitFormUseCase, notifyUseCase, logger }) {
    this.handleNewReservationUseCase = handleNewReservationUseCase;
    this.getActiveReservationsUseCase = getActiveReservationsUseCase;
    this.submitFormUseCase = submitFormUseCase;
    this.notifyUseCase = notifyUseCase;
    this.logger = logger;
  }

  async handleReservations() {
    this.logger.info('Start - HandleNewReservations');
    await this.handleNewReservationUseCase.execute();
    this.logger.info('End - HandleNewReservations');

    this.logger.info('Start - GetActiveReservations');
    const reservations = await this.getActiveReservationsUseCase.execute();
    this.logger.info('End - GetActiveReservations');
    const notHandledReservations = reservations.filter(reservation => reservation.isNotHandled);

    for (const notHandledReservation of notHandledReservations) {
      this.logger.info(`Start - SubmitForm for ${notHandledReservation.code}`);
      await this.submitFormUseCase.execute(notHandledReservation, true);
      this.logger.info(`End - SubmitForm for ${notHandledReservation.code}`);
    }

    const submittedReservations = reservations.filter(reservation => reservation.isValidated || reservation.isRequiresValidation);
    for (const submittedReservation of submittedReservations) {
      this.logger.info(`Start - Notify for ${submittedReservation.code}`);
      await this.notifyUseCase.execute(submittedReservation);
      this.logger.info(`End - Notify for ${submittedReservation.code}`);
    }
  }
}

const VALIDATION_SUBJECT = 'UCPA Contremarque';
const VALIDATION_TEXT = 'Tu peux dès à présent retrouver ton e-billet sur le site internet de ton centre';

export class NotifyUseCase {
  constructor({ mailAdapter, searchQuery, reservationRepository, timeSlotDatasource, notificationAdapter, timeSlotsPreferences, areaId }) {
    this.mailAdapter = mailAdapter;
    this.searchQuery = searchQuery;
    this.reservationRepository = reservationRepository;
    this.timeSlotDatasource = timeSlotDatasource;
    this.notificationAdapter = notificationAdapter;
    this.timeSlotsPreferences = timeSlotsPreferences;
    this.areaId = areaId;
  }

  async execute(reservation) {
    if (reservation.isRequiresValidation) {
      await this._verifyValidation(reservation, this.reservationRepository, this.mailAdapter);
    }

    if (!reservation.isValidated) {
      return null;
    }

    const timeSlots = await this.timeSlotDatasource.getAllAvailable(this.areaId);
    const convenientTimeSlots = this._getConvientTimeSlots(timeSlots, this.timeSlotsPreferences);
    await this.notificationAdapter.notify(convenientTimeSlots);
    reservation.markAsNotified();
    await this.reservationRepository.save(reservation);
  }

  async _verifyValidation(reservation, reservationRepositories, mailAdapter) {
    const formSubmittedAt = reservation.updatedAt;
    const messages = await mailAdapter.fetch(this.searchQuery);
    for (const message of messages) {
      if (message.title === VALIDATION_SUBJECT && formSubmittedAt < message.date && message.html.includes(VALIDATION_TEXT)) {
        await this.mailAdapter.deleteMail(message.uid);
        reservation.markAsValidated();
        await reservationRepositories.save(reservation);
        return;
      }
    }
  }

  _getConvientTimeSlots(timeSlots, timeSlotsPreferences) {
    return timeSlots
      .filter(slot => slot.isConvenient(timeSlotsPreferences))
      .sort((slotA, slotB) => slotA.isMoreConvenient(slotB, timeSlotsPreferences))
      .map(slot => slot.toString())
      .join('\n');
  }
}

const VALIDATION_SUBJECT = 'UCPA Contremarque';
const VALIDATION_TEXT = 'Tu peux dès à présent retrouver ton e-billet sur le site internet de ton centre';

export class NotifyUseCase {
  constructor({ imapClient, searchQuery, reservationRepositories, timeSlotDatasource, notificationClient, timeSlotsPreferences, areaId }) {
    this.imapClient = imapClient;
    this.searchQuery = searchQuery;
    this.reservationRepositories = reservationRepositories;
    this.timeSlotDatasource = timeSlotDatasource;
    this.notificationClient = notificationClient;
    this.timeSlotsPreferences = timeSlotsPreferences;
    this.areaId = areaId;
  }

  async execute(reservation) {
    if (reservation.isRequiresValidation) {
      await this._verifyValidation(reservation, this.reservationRepositories, this.imapClient);
    }

    if (!reservation.isValidated) {
      return null;
    }

    const timeSlots = await this.timeSlotDatasource.getAllAvailable(this.areaId);
    const convenientTimeSlots = this._getConvientTimeSlots(timeSlots, this.timeSlotsPreferences);
    await this.notificationClient.notify(convenientTimeSlots);
    reservation.markAsNotified();
    this.reservationRepositories.save(reservation);
  }

  async _verifyValidation(reservation, reservationRepositories, imapClient) {
    const formSubmittedAt = reservation.updatedAt;
    const messages = await imapClient.fetch(this.searchQuery);
    for (const message of messages) {
      if (message.title === VALIDATION_SUBJECT && formSubmittedAt < message.date && message.html.includes(VALIDATION_TEXT)) {
        await this.imapClient.deleteMail(message.uid);
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

export class GetAllEventsUseCase {
  constructor({ calendarRepository }) {
    this.calendarRepository = calendarRepository;
  }

  async execute() {
    return this.calendarRepository.getAllForSubscription();
  }
}

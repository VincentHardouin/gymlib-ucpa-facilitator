export class UnregisterPassUpdateUseCase {
  constructor({ registrationRepository, deviceRepository }) {
    this.registrationRepository = registrationRepository;
    this.deviceRepository = deviceRepository;
  }

  async execute({ deviceLibraryIdentifier, passTypeIdentifier, serialNumber }) {
    await this.registrationRepository.delete({ deviceLibraryIdentifier, passTypeIdentifier, serialNumber });
    const registrations = await this.registrationRepository.find({ deviceLibraryIdentifier });
    if (registrations.length === 0) {
      await this.deviceRepository.delete({ deviceLibraryIdentifier });
    }
  }
}

import dayjs from 'dayjs';

export class FindUpdatablePassesUseCase {
  constructor({ passRepository, registrationRepository }) {
    this.passRepository = passRepository;
    this.registrationRepository = registrationRepository;
  }

  async execute({ deviceLibraryIdentifier, passTypeIdentifier, passesUpdatedSince }) {
    if (!passesUpdatedSince) {
      const registrations = await this.registrationRepository.find({ deviceLibraryIdentifier, passTypeIdentifier });
      const lastRegistration = registrations[0];
      passesUpdatedSince = lastRegistration.created_at.toISOString();
    }
    else {
      passesUpdatedSince = dayjs.unix(passesUpdatedSince).toISOString();
    }
    const updatedPasses = await this.passRepository.findUpdated({ deviceLibraryIdentifier, passTypeIdentifier, passesUpdatedSince });

    if (updatedPasses.length === 0) {
      return {
        serialNumbers: [],
        lastUpdated: passesUpdatedSince,
      };
    }
    const lastUpdatedPass = updatedPasses.sort((a, b) => a.updated_at - b.updated_at)[0];

    return {
      serialNumbers: updatedPasses.map(({ serialNumber }) => serialNumber),
      lastUpdated: lastUpdatedPass.updated_at,
    };
  }
}

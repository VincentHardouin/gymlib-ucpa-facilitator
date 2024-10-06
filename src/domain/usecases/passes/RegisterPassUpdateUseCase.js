import { NotFoundError } from '../../Errors.js';

export class RegisterPassUpdateUseCase {
  constructor({ deviceRepository, registrationRepository, passRepository }) {
    this.deviceRepository = deviceRepository;
    this.registrationRepository = registrationRepository;
    this.passRepository = passRepository;
  }

  async execute({ deviceLibraryIdentifier, passTypeIdentifier, serialNumber, pushToken }) {
    await this.createDeviceIfNotExist({ deviceLibraryIdentifier, pushToken });
    await this.passRepository.get({ passTypeIdentifier, serialNumber });
    return this.createRegistrationIfNotExist({ serialNumber, deviceLibraryIdentifier, passTypeIdentifier });
  }

  async createDeviceIfNotExist({ deviceLibraryIdentifier, pushToken }) {
    try {
      await this.deviceRepository.get({ deviceLibraryIdentifier });
    }
    catch (e) {
      if (e instanceof NotFoundError) {
        await this.deviceRepository.save({ deviceLibraryIdentifier, pushToken });
      }
      else {
        throw e;
      }
    }
  }

  async createRegistrationIfNotExist({ serialNumber, deviceLibraryIdentifier, passTypeIdentifier }) {
    try {
      await this.registrationRepository.get({ serialNumber, deviceLibraryIdentifier, passTypeIdentifier });
      return { creation: false };
    }
    catch (e) {
      if (e instanceof NotFoundError) {
        await this.registrationRepository.save({ serialNumber, deviceLibraryIdentifier, passTypeIdentifier });
        return { creation: true };
      }
      else {
        throw e;
      }
    }
  }
}

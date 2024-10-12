import { knex } from '../../../db/knex-database-connection.js';
import { NotFoundError } from '../../domain/Errors.js';

class DeviceRepository {
  #knex;

  constructor(knex) {
    this.#knex = knex;
  }

  async get({ deviceLibraryIdentifier }) {
    const device = await this.#knex('devices').where({ deviceLibraryIdentifier }).first();
    if (!device) {
      throw new NotFoundError('Device not found');
    }
    return device;
  }

  async save({ deviceLibraryIdentifier, pushToken }) {
    await this.#knex('devices').insert({ deviceLibraryIdentifier, pushToken });
  }

  async delete({ deviceLibraryIdentifier }) {
    await this.#knex('devices').delete().where({ deviceLibraryIdentifier });
  }

  async findByPasses(passes) {
    return this.#knex('devices')
      .distinct('devices.deviceLibraryIdentifier', 'pushToken')
      .innerJoin('registrations', 'registrations.deviceLibraryIdentifier', 'devices.deviceLibraryIdentifier')
      .whereIn('passTypeIdentifier', passes.map(({ passTypeIdentifier }) => passTypeIdentifier))
      .whereIn('serialNumber', passes.map(({ serialNumber }) => serialNumber));
  }
}

export const deviceRepository = new DeviceRepository(knex);

import { knex } from '../../db/knex-database-connection.js';
import { NotFoundError } from '../domain/Errors.js';

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
}

export const deviceRepository = new DeviceRepository(knex);

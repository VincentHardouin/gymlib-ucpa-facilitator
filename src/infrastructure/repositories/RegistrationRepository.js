import { knex } from '../../../db/knex-database-connection.js';
import { NotFoundError } from '../../domain/Errors.js';

class RegistrationRepository {
  #knex;

  constructor(knex) {
    this.#knex = knex;
  }

  async get({ serialNumber, deviceLibraryIdentifier, passTypeIdentifier }) {
    const registration = await this.#knex('registrations').where({ serialNumber, deviceLibraryIdentifier, passTypeIdentifier }).first();
    if (!registration) {
      throw new NotFoundError();
    }
    return registration;
  }

  async find({ deviceLibraryIdentifier, passTypeIdentifier }) {
    const query = this.#knex('registrations')
      .where({ deviceLibraryIdentifier })
      .orderBy('created_at', 'desc');

    if (passTypeIdentifier) {
      query.andWhere({ passTypeIdentifier });
    }

    return query;
  }

  async save({ serialNumber, deviceLibraryIdentifier, passTypeIdentifier }) {
    await this.#knex('registrations').insert({ serialNumber, deviceLibraryIdentifier, passTypeIdentifier });
  }

  async delete({ serialNumber, deviceLibraryIdentifier, passTypeIdentifier }) {
    await this.#knex('registrations').where({ serialNumber, deviceLibraryIdentifier, passTypeIdentifier }).delete();
  }
}

export const registrationRepository = new RegistrationRepository(knex);

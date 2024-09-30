import { knex } from '../../db/knex-database-connection.js';
import { NotFoundError } from '../domain/NotFoundError.js';

class PassRepository {
  #knex;

  constructor(knex) {
    this.#knex = knex;
  }

  async get({ passTypeIdentifier, serialNumber }) {
    const pass = await this.#knex('passes').where({ passTypeIdentifier, serialNumber }).first();
    if (!pass) {
      throw new NotFoundError();
    }
    return pass;
  }

  async save({ passTypeIdentifier, serialNumber }) {
    await this.#knex('passes').insert({ passTypeIdentifier, serialNumber });
  }

  async findUpdated({ deviceLibraryIdentifier, passTypeIdentifier, passesUpdatedSince }) {
    return this.#knex('passes')
      .select('passes.serialNumber', 'passes.updated_at')
      .innerJoin('registrations', 'passes.passTypeIdentifier', 'registrations.passTypeIdentifier')
      .where({ deviceLibraryIdentifier })
      .andWhere('passes.passTypeIdentifier', passTypeIdentifier)
      .andWhere('updated_at', '>', passesUpdatedSince);
  }

  async updateAll({ nextEvent }) {
    await this.#knex('passes').update({ nextEvent, updated_at: new Date() });
  }
}

export const passRepository = new PassRepository(knex);

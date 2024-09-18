import { knex } from 'src/infrastructure';

class ReservationRepositories {
  #knex;

  constructor(knex) {
    this.#knex = knex;
  }

  getOrCreate() {

  }
}

export const reservationRepositories = new ReservationRepositories(knex);

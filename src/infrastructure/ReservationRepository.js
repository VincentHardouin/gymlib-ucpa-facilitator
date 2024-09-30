import { knex } from '../../db/knex-database-connection.js';
import { NotFoundError } from '../domain/NotFoundError.js';
import { Reservation } from '../domain/Reservation.js';

class ReservationRepository {
  #knex;

  constructor(knex) {
    this.#knex = knex;
  }

  async get(code) {
    const reservation = await this.#knex('reservations').select('*').where({ code }).first();
    if (!reservation)
      throw new NotFoundError(`Reservation not found with code ${code}`);
    return this._toDomain(reservation);
  }

  async save(reservation) {
    const { code, status, updatedAt, start, court, activity } = reservation;
    await this.#knex('reservations')
      .insert({ code, status, updated_at: updatedAt, start_at: start, court, activity })
      .onConflict('code')
      .merge(['status', 'updated_at', 'start_at', 'court', 'activity']);
  }

  async getActiveReservations() {
    const reservations = await this.#knex('reservations')
      .select('*')
      .where('status', '!=', Reservation.STATUSES.COMPLETED)
      .orderBy('created_at', 'asc');
    return reservations.map(reservation => this._toDomain(reservation));
  }

  async findByStatus(status) {
    const reservations = await this.#knex('reservations')
      .select('*')
      .where('status', '=', status)
      .orderBy('created_at', 'asc');
    return reservations.map(reservation => this._toDomain(reservation));
  }

  async getNextEvent() {
    const reservation = await this.#knex('reservations')
      .select('*')
      .where('status', '=', Reservation.STATUSES.RESERVED)
      .andWhere('start_at', '>', new Date())
      .orderBy('start_at', 'asc')
      .first();
    if (!reservation) {
      throw new NotFoundError();
    }
    return this._toDomain(reservation);
  }

  _toDomain(reservationRaw) {
    return new Reservation({
      code: reservationRaw.code,
      status: reservationRaw.status,
      updatedAt: reservationRaw.updated_at,
      start: reservationRaw.start_at,
      court: reservationRaw.court,
      activity: reservationRaw.activity,
    });
  }
}

export const reservationRepository = new ReservationRepository(knex);

import { knex } from '../../../db/knex-database-connection.js';
import { Reservation } from '../../../src/domain/Reservation.js';
import { reservationRepository } from '../../../src/infrastructure/repositories/ReservationRepository.js';
import { expect, sinon } from '../../test-helpers.js';

describe('Integration | Infrastructure | ReservationRepository', function () {
  describe('#save', function () {
    let clock;
    const now = new Date('2024-01-01');

    beforeEach(async function () {
      await knex('reservations').delete();
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    });

    afterEach(async function () {
      await knex('reservations').delete();
      clock.restore();
    });

    it('should save reservation', async function () {
      const code = 'ABCD123';
      const reservation = Reservation.createFromCode(code);

      await reservationRepository.save(reservation);

      const { created_at, updated_at, ...reservations } = await knex('reservations').where({ code }).first();
      expect(reservations).to.deep.equal({ code, status: reservation.status, court: null, start_at: null, activity: null });
    });

    context('when reservation already exists', function () {
      it('should update', async function () {
        const code = 'ABCD123';
        const reservation = Reservation.createFromCode(code);

        await reservationRepository.save(reservation);

        reservation.markAsReserved({ start: new Date('2024-10-10'), court: '10', activity: 'Badminton' });
        await reservationRepository.save(reservation);

        const { created_at, updated_at, ...reservations } = await knex('reservations').where({ code }).first();
        expect(reservations).to.deep.equal({ code, status: reservation.status, court: '10', start_at: new Date('2024-10-10'), activity: 'Badminton' });
      });
    });
  });
});

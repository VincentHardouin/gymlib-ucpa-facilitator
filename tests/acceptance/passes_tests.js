import dayjs from 'dayjs';
import { knex } from '../../db/knex-database-connection.js';
import { createServer } from '../../server.js';
import { passController } from '../../src/application/index.js';
import { authService } from '../../src/infrastructure/AuthService.js';
import { expect, generateAuthorizationToken, sinon } from '../test-helpers.js';

describe('Acceptance | Endpoints | Passes', function () {
  let server;

  beforeEach(async function () {
    passController.passAdapter = {
      get: async () => {},
    };
    server = await createServer({ passController, authService });
    await knex('reservations').delete();
    await knex('registrations').delete();
    await knex('devices').delete();
    await knex('passes').delete();
    await knex('passes').insert({ passTypeIdentifier: 'passId', serialNumber: '12345' });
  });

  afterEach(async function () {
    await knex('reservations').delete();
    await knex('registrations').delete();
    await knex('devices').delete();
    await knex('passes').delete();
  });

  describe('Register pass', function () {
    context('when registration does not exist', function () {
      it('should save device and register pass', async function () {
        const deviceLibraryIdentifier = 'deviceId';
        const passTypeIdentifier = 'passId';
        const serialNumber = '12345';
        const token = await generateAuthorizationToken();

        const response = await server.inject({
          method: 'POST',
          url: `/v1/devices/${deviceLibraryIdentifier}/registrations/${passTypeIdentifier}/${serialNumber}`,
          headers: { authorization: token },
          payload: {
            pushToken: 'push-token',
          },
        });

        expect(response.statusCode).to.equal(201);
        const savedRegistrations = await knex('registrations')
          .select('deviceLibraryIdentifier', 'passTypeIdentifier', 'serialNumber')
          .where({ deviceLibraryIdentifier, passTypeIdentifier, serialNumber })
          .first();
        expect(savedRegistrations).to.be.deep.equal({ deviceLibraryIdentifier, passTypeIdentifier, serialNumber });
      });
    });

    context('when registration exists', function () {
      it('should do nothing', async function () {
        const deviceLibraryIdentifier = 'deviceId';
        const passTypeIdentifier = 'passId';
        const serialNumber = '12345';
        const pushToken = 'push-token';
        const token = await generateAuthorizationToken();

        await knex('devices').insert({ deviceLibraryIdentifier, pushToken });
        await knex('registrations').insert({ deviceLibraryIdentifier, passTypeIdentifier, serialNumber });

        const response = await server.inject({
          method: 'POST',
          url: `/v1/devices/${deviceLibraryIdentifier}/registrations/${passTypeIdentifier}/${serialNumber}`,
          headers: { authorization: token },
          payload: {
            pushToken,
          },
        });

        expect(response.statusCode).to.equal(200);
      });
    });
  });

  describe('Unregister pass', function () {
    it('should unregister pass', async function () {
      const deviceLibraryIdentifier = 'deviceId';
      const passTypeIdentifier = 'passId';
      const serialNumber = '12345';
      const anotherSerialNumber = '6789';
      const pushToken = 'push-token';
      const token = await generateAuthorizationToken();

      await knex('passes').insert({ passTypeIdentifier, serialNumber: anotherSerialNumber });
      await knex('devices').insert({ deviceLibraryIdentifier, pushToken });
      await knex('registrations').insert({ deviceLibraryIdentifier, passTypeIdentifier, serialNumber });
      await knex('registrations').insert({ deviceLibraryIdentifier, passTypeIdentifier, serialNumber: anotherSerialNumber });

      const response = await server.inject({
        method: 'DELETE',
        url: `/v1/devices/${deviceLibraryIdentifier}/registrations/${passTypeIdentifier}/${serialNumber}`,
        headers: { authorization: token },
      });

      expect(response.statusCode).to.equal(200);
      const deletedRegistration = await knex('registrations').where({ deviceLibraryIdentifier, passTypeIdentifier, serialNumber });
      expect(deletedRegistration).to.have.lengthOf(0);

      const keptRegistrations = await knex('registrations').where({ deviceLibraryIdentifier, passTypeIdentifier });
      expect(keptRegistrations).to.have.lengthOf(1);
    });

    context('when there is the last device registration', function () {
      it('should also remove device', async function () {
        const deviceLibraryIdentifier = 'deviceId';
        const passTypeIdentifier = 'passId';
        const serialNumber = '12345';
        const pushToken = 'push-token';
        const token = await generateAuthorizationToken();

        await knex('devices').insert({ deviceLibraryIdentifier, pushToken });
        await knex('registrations').insert({ deviceLibraryIdentifier, passTypeIdentifier, serialNumber });

        const response = await server.inject({
          method: 'DELETE',
          url: `/v1/devices/${deviceLibraryIdentifier}/registrations/${passTypeIdentifier}/${serialNumber}`,
          headers: { authorization: token },
        });

        expect(response.statusCode).to.equal(200);
        const deletedRegistration = await knex('registrations').where({ deviceLibraryIdentifier, passTypeIdentifier, serialNumber });
        expect(deletedRegistration).to.have.lengthOf(0);

        const deletedDevices = await knex('devices').where({ deviceLibraryIdentifier, pushToken });
        expect(deletedDevices).to.have.lengthOf(0);
      });
    });
  });

  describe('Get Updatable Passes', function () {
    context('when it is the first call', function () {
      it('should return updatable pass without passesUpdatedSince', async function () {
        const deviceLibraryIdentifier = 'deviceId';
        const passTypeIdentifier = 'passId';
        const serialNumber = '12345';
        const pushToken = 'push-token';

        await knex('devices').insert({ deviceLibraryIdentifier, pushToken });
        await knex('registrations').insert({ deviceLibraryIdentifier, passTypeIdentifier, serialNumber });

        const response = await server.inject({
          method: 'GET',
          url: `/v1/devices/${deviceLibraryIdentifier}/registrations/${passTypeIdentifier}`,
        });

        expect(response.statusCode).to.equal(204);
      });
    });

    context('when it is not the first time', function () {
      let now;
      let clock;

      beforeEach(function () {
        now = new Date('2024-01-01');
        clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
      });

      afterEach(function () {
        clock.restore();
      });

      it('should return updatable pass based on passesUpdatedSince', async function () {
        const deviceLibraryIdentifier = 'deviceId';
        const passTypeIdentifier = 'passId';
        const serialNumber = '12345';
        const pushToken = 'push-token';

        await knex('passes').update({ updated_at: new Date('2024-01-02') }).where({ passTypeIdentifier, serialNumber });

        await knex('devices').insert({ deviceLibraryIdentifier, pushToken });
        await knex('registrations').insert({ deviceLibraryIdentifier, passTypeIdentifier, serialNumber });

        const passesUpdatedSince = dayjs('2024-01-01').unix();

        const response = await server.inject({
          method: 'GET',
          url: `/v1/devices/${deviceLibraryIdentifier}/registrations/${passTypeIdentifier}?passesUpdatedSince=${passesUpdatedSince}`,
        });

        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal({ serialNumbers: ['12345'], lastUpdated: '1704153600' });
      });
    });
  });

  describe('Get updated pass', function () {
    it('should return updated pass', async function () {
      const passTypeIdentifier = 'passId';
      const serialNumber = '12345';
      const token = await generateAuthorizationToken();

      const nextEvent = '123';

      await knex('passes').update({ nextEvent }).where({ passTypeIdentifier, serialNumber });
      await knex('reservations').insert({ code: nextEvent, start_at: new Date('2024-01-10'), court: '10', activity: 'Badminton', status: 'reserved', updated_at: new Date('2024-01-02') });

      const response = await server.inject({
        method: 'GET',
        url: `/v1/passes/${passTypeIdentifier}/${serialNumber}`,
        headers: { authorization: token },
      });

      expect(response.statusCode).to.equal(200);
      const { 'content-type': contentType, 'last-modified': lastUpdated } = response.headers;
      expect(contentType).to.equal('application/vnd.apple.pkpass');
      expect(lastUpdated).to.equal('Tue, 02, Jan, 2024 00:00:00 GMT');
    });
  });

  describe('Create passe', function () {
    context('when next event exists', function () {
      let now;
      let clock;

      beforeEach(function () {
        now = new Date('2024-01-01');
        clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
      });

      afterEach(function () {
        clock.restore();
      });

      it('should return pass', async function () {
        const token = await generateAuthorizationToken();
        await knex('reservations').insert({ code: '12345', start_at: new Date('2024-01-10'), court: '10', activity: 'Badminton', status: 'reserved', updated_at: new Date('2024-01-02') });

        const response = await server.inject({
          method: 'POST',
          url: '/pass',
          headers: { authorization: token },
        });

        expect(response.statusCode).to.equal(201);
        expect(response.headers['content-type']).to.equal('application/vnd.apple.pkpass');
      });
    });

    context('when next event does not exist', function () {
      it('should return 503', async function () {
        const token = await generateAuthorizationToken();

        const response = await server.inject({
          method: 'POST',
          url: '/pass',
          headers: { authorization: token },
        });

        expect(response.statusCode).to.equal(503);
      });
    });
  });
});

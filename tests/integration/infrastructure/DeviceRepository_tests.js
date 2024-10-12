import { knex } from '../../../db/knex-database-connection.js';
import { deviceRepository } from '../../../src/infrastructure/repositories/DeviceRepository.js';
import { expect, sinon } from '../../test-helpers.js';

describe('Integration | Infrastructure | DeviceRepository', function () {
  describe('#save', function () {
    let clock;
    const now = new Date('2024-01-01');

    beforeEach(async function () {
      await knex('devices').delete();
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    });

    afterEach(async function () {
      await knex('devices').delete();
      clock.restore();
    });

    it('should save device', async function () {
      const device = {
        deviceLibraryIdentifier: 'device-type-id',
        pushToken: 'push-token',
      };

      await deviceRepository.save(device);

      const { created_at, ...savedDevice } = await knex('devices').where(device).first();
      expect(savedDevice).to.deep.equal(device);
    });
  });

  describe('#findByPasses', function () {
    beforeEach(async function () {
      await knex('registrations').delete();
      await knex('passes').delete();
      await knex('devices').delete();
    });

    afterEach(async function () {
      await knex('registrations').delete();
      await knex('passes').delete();
      await knex('devices').delete();
    });

    it('should return devices register to given passes', async function () {
      const device1 = {
        deviceLibraryIdentifier: 'device-type-id-1',
        pushToken: 'push-token-2',
      };

      const device2 = {
        deviceLibraryIdentifier: 'device-type-id-2',
        pushToken: 'push-token-2',
      };
      await knex('devices').insert([device1, device2]);

      const pass1 = {
        passTypeIdentifier: 'pass.type.identifier1',
        serialNumber: 'serial1',
      };
      const pass2 = {
        passTypeIdentifier: 'pass.type.identifier2',
        serialNumber: 'serial2',
      };
      const pass3 = {
        passTypeIdentifier: 'pass.type.identifier2',
        serialNumber: 'serial3',
      };
      await knex('passes').insert([pass1, pass2, pass3]);

      await knex('registrations').insert({
        deviceLibraryIdentifier: device1.deviceLibraryIdentifier,
        passTypeIdentifier: pass1.passTypeIdentifier,
        serialNumber: pass1.serialNumber,
      });
      await knex('registrations').insert({
        deviceLibraryIdentifier: device1.deviceLibraryIdentifier,
        passTypeIdentifier: pass2.passTypeIdentifier,
        serialNumber: pass2.serialNumber,
      });
      await knex('registrations').insert({
        deviceLibraryIdentifier: device2.deviceLibraryIdentifier,
        passTypeIdentifier: pass2.passTypeIdentifier,
        serialNumber: pass2.serialNumber,
      });

      const devices = await deviceRepository.findByPasses([pass1, pass2]);

      expect(devices).to.deep.equal([
        {
          deviceLibraryIdentifier: 'device-type-id-1',
          pushToken: 'push-token-2',
        },
        {
          deviceLibraryIdentifier: 'device-type-id-2',
          pushToken: 'push-token-2',
        },
      ]);
    });
  });
});

import { TimeSlot } from '../../../src/domain/TimeSlot.js';
import { TimeSlotDatasource } from '../../../src/infrastructure/TimeSlotDatasource.js';
import { expect, nock, sinon } from '../../test-helpers.js';

describe('Integration | Infrastructure | TimeSlotDatasource', function () {
  describe('#getAllAvailable', function () {
    let clock;
    const now = new Date('2024-01-01');

    beforeEach(function () {
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    });

    afterEach(function () {
      clock.restore();
    });

    it('should call ucpa url with correct params', async function () {
      const areaId = 'area-id';

      const item = {
        start_time: 1727175600000,
        end_time: 1727179199000,
        date: '24 sept. (mar.)',
        type: 'Badminton',
        stock: 2,
        justOnePlace: true,
        startTime: '13h00',
        endTime: '14h00',
        startDate: '24/09/2024',
        endDate: 'Invalid date',
        codes: [
          '415945915',
          '415942814',
          '415944289',
        ],
        isDisabled: false,
        hasStock: true,
        area: 'Badminton',
        areas: [
          {
            uuid: 'area_1639603560_9977f290-5ded-11ec-96d0-03e553c50e2f',
            name: 'Badminton',
          },
        ],
        activity_description: '',
        activity_color: '#FF4310',
        activity_type: 'TERRAIN',
        group: 'Badminton',
        groupCode: 'BADMINTON',
        activity_codes: [
          '105025661',
          '105025520',
          '105025606',
        ],
        product_reference: '59F',
        redirect: true,
        showStock: true,
        grouped: true,
        hoursReserveLimitation: false,
        reservationLimitMessage: null,
        stockLabel: '2 terrains',
      };
      const now = '01-01-2024';
      const scope = nock('https://www.ucpa.com')
        .get(
          `/sport-station/api/areas-offers/weekly/alpha_hp?=&reservationPeriod=1&espace=${areaId}&time=${now}&__amp_source_origin=https://www.ucpa.com`,
        )
        .reply(200, { planner: { columns: [{ items: [] }] } });
      const next = '08-01-2024';
      const scope2 = nock('https://www.ucpa.com')
        .get(
          `/sport-station/api/areas-offers/weekly/alpha_hp?=&reservationPeriod=1&espace=${areaId}&time=${next}&__amp_source_origin=https://www.ucpa.com`,
        )
        .reply(200, { planner: { columns: [{ items: [] }] } });
      const afterNext = '15-01-2024';
      const scope3 = nock('https://www.ucpa.com')
        .get(
          `/sport-station/api/areas-offers/weekly/alpha_hp?=&reservationPeriod=1&espace=${areaId}&time=${afterNext}&__amp_source_origin=https://www.ucpa.com`,
        )
        .reply(200, { planner: { columns: [{ items: [item] }] } });

      const timeSlot = new TimeSlotDatasource();

      const result = await timeSlot.getAllAvailable(areaId);

      expect(scope.isDone()).to.be.true;
      expect(scope2.isDone()).to.be.true;
      expect(scope3.isDone()).to.be.true;

      expect(result).to.be.lengthOf(1);
      expect(result[0]).to.be.instanceOf(TimeSlot);
      expect(result[0].startTimestamp).to.be.equal(item.start_time);
      expect(result[0].startTime).to.be.equal(item.startTime);
      expect(result[0].endTime).to.be.equal(item.endTime);
      expect(result[0].startDate).to.be.equal(item.startDate);
      expect(result[0].stock).to.be.equal(item.stock);
    });
  });
});

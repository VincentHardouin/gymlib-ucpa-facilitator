import { TimeSlot } from '../../../src/domain/TimeSlot.js';
import { expect } from '../../test-helpers.js';

describe('Unit | Domain | TimeSlot', function () {
  describe('#isMoreConvenient', function () {
    context('when time slots are not on the same day', function () {
      it('should use config day order', async function () {
        const preferences = {
          sun: [
            '19h00',
          ],
          mon: [
            '19h00',
          ],
        };
        const timeSlot = new TimeSlot(
          {
            startTimestamp: new Date('2024/09/23').valueOf(),
            startTime: '19h00',
            endTime: '20h00',
            startDate: '23/09/2024',
            stock: 1,
          },
        );
        const timeSlotB = new TimeSlot(
          {
            startTimestamp: new Date('2024/09/22').valueOf(),
            startTime: '19h00',
            endTime: '20h00',
            startDate: '22/09/2024',
          },
        );

        const isMoreConvenientA = timeSlot.isMoreConvenient(timeSlotB, preferences);
        const isMoreConvenientB = timeSlotB.isMoreConvenient(timeSlot, preferences);

        // 1 : Should come after
        // -1 : Should come before
        expect(isMoreConvenientA).to.equal(1);
        expect(isMoreConvenientB).to.equal(-1);
      });
    });

    context('when two time slot is on the same day', function () {
      it('should use hours to order time slot', async function () {
        const preferences = {
          mon: [
            '19h00',
            '20h00',
          ],
        };
        const timeSlot = new TimeSlot(
          {
            startTimestamp: 1727114400000,
            startTime: '20h00',
            endTime: '21h00',
            startDate: '23/09/2024',
          },
        );
        const timeSlotB = new TimeSlot(
          {
            startTimestamp: 1727114400000,
            startTime: '19h00',
            endTime: '20h00',
            startDate: '23/09/2024',
          },
        );

        const isMoreConvenient = await timeSlot.isMoreConvenient(timeSlotB, preferences);
        const isMoreConvenientB = await timeSlotB.isMoreConvenient(timeSlot, preferences);

        expect(isMoreConvenient).to.be.equal(1);
        expect(isMoreConvenientB).to.be.equal(-1);
      });
    });
  });
});

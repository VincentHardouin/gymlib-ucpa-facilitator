import { ReservationEvent } from '../../../src/domain/ReservationEvent.js';
import { CalendarRepository } from '../../../src/infrastructure/repositories/CalendarRepository.js';
import { expect, sinon } from '../../test-helpers.js';

describe('Integration | Infrastructure | CalendarRepository', function () {
  let clock;

  beforeEach(function () {
    const now = new Date('2024-09-24');
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  describe('#save', function () {
    it('should save event from ReservationEvent', function () {
      const calRepositories = new CalendarRepository('test');
      const start = new Date();
      const end = new Date(new Date().setHours(new Date().getHours() + 1));
      const event = new ReservationEvent({
        start,
        end,
        name: 'Test Event',
        description: 'It works ;)',
      });

      calRepositories.save(event);

      const { id, ...savedEvent } = calRepositories.cal.toJSON().events[0];
      expect(savedEvent).deep.equal(
        {
          alarms: [],
          allDay: false,
          attachments: [],
          attendees: [],
          busystatus: null,
          categories: [],
          class: null,
          created: null,
          description: {
            plain: 'It works ;)',
          },
          end: '2024-09-24T01:00:00.000Z',
          floating: false,
          lastModified: null,
          location: null,
          organizer: null,
          priority: null,
          recurrenceId: null,
          repeating: null,
          sequence: 0,
          stamp: '2024-09-24T00:00:00.000Z',
          start: '2024-09-24T00:00:00.000Z',
          status: null,
          summary: 'Test Event',
          timezone: null,
          transparency: null,
          url: null,
          x: [],
        },
      );
    });
  });

  describe('#getAllEvents', function () {
    it('should return all saved events', function () {
      const calRepositories = new CalendarRepository('test');
      const start = new Date();
      const end = new Date(new Date().setHours(new Date().getHours() + 1));
      const event = new ReservationEvent({
        start,
        end,
        name: 'Test Event',
        description: 'It works ;) \n\n Code: 12345',
      });
      const event2 = new ReservationEvent({
        start,
        end,
        name: 'Test Event 2',
        description: 'It works ;) \n\n Code: 56789',
      });

      calRepositories.save(event);
      calRepositories.save(event2);

      const events = calRepositories.getAll();

      expect(events[0]).to.be.instanceOf(ReservationEvent);
      expect(events).to.deep.equal([
        {
          end: '2024-09-24T01:00:00.000Z',
          code: '12345',
          name: 'Test Event',
          start: '2024-09-24T00:00:00.000Z',
          description: 'It works ;) \n\n Code: 12345',
        },
        {
          end: '2024-09-24T01:00:00.000Z',
          code: '56789',
          name: 'Test Event 2',
          start: '2024-09-24T00:00:00.000Z',
          description: 'It works ;) \n\n Code: 56789',
        },
      ]);
    });
  });
});

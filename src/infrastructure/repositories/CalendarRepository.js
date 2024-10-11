import { ICalCalendar } from 'ical-generator';
import { ReservationEvent } from '../../domain/ReservationEvent.js';

export class CalendarRepository {
  constructor(name) {
    this.cal = new ICalCalendar({ name });
  }

  save(reservationEvent) {
    const { start, end, name: summary, description } = reservationEvent;
    this.cal.createEvent({
      start,
      end,
      summary,
      description,
    });
  }

  getAll() {
    return this.cal.toJSON().events.map(({ summary, description, start, end }) => {
      return new ReservationEvent({
        code: _getCodeFromDescription(description),
        name: summary,
        description: description.plain,
        start,
        end,
      });
    });
  }

  getAllForSubscription() {
    return this.cal.toString();
  }
}

function _getCodeFromDescription(description) {
  const match = description.plain.match(/Code: (?<code>\d+)/);
  if (!match) {
    return null;
  }
  return match.groups.code;
}

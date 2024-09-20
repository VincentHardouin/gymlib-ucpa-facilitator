import { TimeSlot } from '../domain/TimeSlot.js';
import { httpClient } from './HttpClient.js';

export class TimeSlotDatasource {
  async getAllAvailable(areaId) {
    const requests = [
      getDatePlusDays(0),
      getDatePlusDays(7),
      getDatePlusDays(14),
    ].map(async (date) => {
      return httpClient.get(`https://www.ucpa.com/sport-station/api/areas-offers/weekly/alpha_hp?=&reservationPeriod=1&espace=${areaId}&time=${date}&__amp_source_origin=https://www.ucpa.com`, { 'User-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:127.0) Gecko/20100101 Firefox/127.0' });
    });

    let availableTimeSlots = [];
    for (const request of requests) {
      const { planner } = await request;
      availableTimeSlots = [...availableTimeSlots, ...planner.columns.flatMap(column => column.items).filter(item => item.hasStock)];
    }
    return availableTimeSlots.map(slot => new TimeSlot({
      startTimestamp: slot.start_time,
      startTime: slot.startTime,
      endTime: slot.endTime,
      startDate: slot.startDate,
      stock: slot.stock,
    }));
  }
}

function getDatePlusDays(days) {
  const timestamp = new Date().setDate(new Date().getDate() + days);
  const date = new Date(timestamp);
  let [day, month, year] = [
    date.getDate(),
    date.getMonth() + 1,
    date.getFullYear(),
  ];

  if (day < 10)
    day = `0${day}`;
  if (month < 10)
    month = `0${month}`;

  return `${day}-${month}-${year}`;
}

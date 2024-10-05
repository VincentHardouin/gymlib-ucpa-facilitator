const days = [
  'sun',
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
];

export class TimeSlot {
  constructor({ startTimestamp, startTime, endTime, startDate, stock }) {
    this.startTimestamp = startTimestamp;
    this.startTime = startTime;
    this.endTime = endTime;
    this.startDate = startDate;
    this.stock = stock;
    this.dayOfWeek = getDayOfWeek(startTimestamp);
  }

  isConvenient(timeSlotsPreferences) {
    return timeSlotsPreferences[this.dayOfWeek]?.includes(this.startTime);
  }

  isMoreConvenient(slotToCompare, timeSlotsPreferences) {
    const orderedWeekDays = Object.keys(timeSlotsPreferences);

    const rankDayOfWeekA = orderedWeekDays.indexOf(this.dayOfWeek);
    const rankDayOfWeekB = orderedWeekDays.indexOf(slotToCompare.dayOfWeek);

    const isOnSameDay = this.dayOfWeek === slotToCompare.dayOfWeek;

    if (!isOnSameDay) {
      return rankDayOfWeekA - rankDayOfWeekB;
    }

    return timeSlotsPreferences[this.dayOfWeek].indexOf(this.startTime) - timeSlotsPreferences[slotToCompare.dayOfWeek].indexOf(slotToCompare.startTime);
  }

  toString() {
    return `- ${this.startDate} - ${this.startTime} - Terrains restant : ${this.stock}`;
  }
}

function getDayOfWeek(timestamp) {
  const date = new Date(timestamp);
  return days[date.getDay()];
}

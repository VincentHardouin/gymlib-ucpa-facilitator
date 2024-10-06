export class ReservationPass {
  constructor({ code, start, court, activity, updatedAt, serialNumber, passTypeIdentifier }) {
    this.code = code;
    this.serialNumber = serialNumber;
    this.passTypeIdentifier = passTypeIdentifier;
    this.title = `UCPA - ${activity}`;
    this.court = court;
    this.start = start;
    this.updatedAt = updatedAt;
  }
}

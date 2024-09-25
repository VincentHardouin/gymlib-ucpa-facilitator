export class ReservationEvent {
  constructor({ code, name, description, start, end }) {
    this.code = code;
    this.name = name;
    this.description = description;
    this.start = start;
    this.end = end;
  }

  static fromReservation(reservation) {
    const { code, start, activity, court } = reservation;
    const name = `${activity} - Terrain ${court}`;
    const end = new Date(new Date(start).setHours(start.getHours() + 1));
    const description = `Code: ${code}`;
    return new ReservationEvent({ code, name, start, end, description });
  }
}

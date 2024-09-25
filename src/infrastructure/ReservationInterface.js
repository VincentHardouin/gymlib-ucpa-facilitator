export class ReservationInterface {
  constructor({ reservationController }) {
    this.reservationController = reservationController;
  }

  register(server) {
    server.route([
      {
        method: 'GET',
        path: '/reservations/calendar',
        options: {
          handler: async (_, h) => {
            const calendar = await this.reservationController.getCalendar();
            const response = h
              .response(calendar)
              .type('text/calendar; charset=utf-8');
            response.header('Content-Disposition', 'attachment; filename="calendar.ics"');
            return response;
          },
          tags: ['api', 'reservations', 'calendar'],
        },
      },
    ]);
  }
}

import { env } from 'node:process';
import { Reservation } from './src/domain/Reservation.js';

import { ImapClient } from './src/infrastructure/ImapClient.js';
import { reservationRepositories } from './src/infrastructure/ReservationRepositories.js';
import 'dotenv/config';

const imapConfig = {
  host: env.GYMLIB_MAIL_RECEIVER_IMAP_HOST,
  port: env.GYMLIB_MAIL_RECEIVER_IMAP_PORT,
  user: env.GYMLIB_MAIL_RECEIVER_IMAP_USER,
  password: env.GYMLIB_MAIL_RECEIVER_IMAP_PASSWORD,
};

async function main() {
  const client = new ImapClient(imapConfig);
  const searchQuery = JSON.parse(env.GYMLIB_MAIL_RECEIVER_IMAP_SEARCH_QUERY);
  const messages = await client.fetch(searchQuery);
  for (const message of messages) {
    const code = getUCPAReservationCode(message);
    await reservationRepositories.getOrCreate(code);
  }
  const reservations = await reservationRepositories.getActiveReservations(code);
  for (const reservation of reservations) {
    handleReservation(reservation);
  }
}

function getUCPAReservationCode(message) {
  const match = message.html.match(/Voici votre code de réservation UCPA : (?<code>\d+)/);
  if (!match) {
    return null;
  }
  return match.groups.code;
}

function handleReservation(reservation) {
  switch (reservation.state) {
    case Reservation.STATES.DEFAULT:
    case Reservation.STATES.NO_HANDLED:
    case Reservation.STATES.FORM_ERROR:
      // form + update state
    // eslint-disable-next-line no-fallthrough
    case Reservation.STATES.FORM_SUBMITTED:
      // rien à faire
      break;
    case Reservation.STATES.UCPA_VALIDATED:
      // Notifier + update state
    case Reservation.STATES.COMPLETED:
      break;
  }
}

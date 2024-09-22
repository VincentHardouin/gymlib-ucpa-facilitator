import { config } from './config.js';

import { ReservationController } from './src/application/ReservationController.js';

import { GetActiveReservationsUseCase } from './src/domain/usecases/GetActiveReservationsUseCase.js';
import { HandleNewReservationUseCase } from './src/domain/usecases/HandleNewReservationUseCase.js';
import { NotifyUseCase } from './src/domain/usecases/NotifyUseCase.js';
import { SubmitFormUseCase } from './src/domain/usecases/SubmitFormUseCase.js';
import { Browser } from './src/infrastructure/Browser.js';
import { ImapClient } from './src/infrastructure/ImapClient.js';
import { logger } from './src/infrastructure/logger.js';
import { NotificationClient } from './src/infrastructure/NotificationClient.js';
import { reservationRepositories } from './src/infrastructure/ReservationRepositories.js';
import { TimeSlotDatasource } from './src/infrastructure/TimeSlotDatasource.js';
import 'dotenv/config';

main();

async function main() {
  const gymlibImapClient = new ImapClient(config.gymlib.imapConfig);
  const handleNewReservationUseCase = new HandleNewReservationUseCase({
    imapClient: gymlibImapClient,
    searchQuery: config.gymlib.searchQuery,
  });

  const getActiveReservationsUseCase = new GetActiveReservationsUseCase({
    reservationRepositories,
  });

  const browser = await Browser.create();
  const submitFormUseCase = new SubmitFormUseCase({
    browser,
    reservationRepositories,
    formInfo: config.ucpa.formInfo,
  });

  const ucpaImapClient = new ImapClient(config.ucpa.imapConfig);
  const timeSlotDatasource = new TimeSlotDatasource();
  const notificationClient = new NotificationClient(config.notification);
  const notifyUseCase = new NotifyUseCase({
    imapClient: ucpaImapClient,
    searchQuery: config.ucpa.searchQuery,
    reservationRepositories,
    timeSlotDatasource,
    notificationClient,
    timeSlotsPreferences: config.timeSlotsPreferences,
  });

  const reservationController = new ReservationController({
    handleNewReservationUseCase,
    getActiveReservationsUseCase,
    submitFormUseCase,
    notifyUseCase,
    logger,
  });

  await reservationController.handleReservations();
}

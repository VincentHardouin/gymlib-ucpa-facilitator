import { CronJob } from 'cron';

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
import { reservationRepository } from './src/infrastructure/ReservationRepository.js';
import { TimeSlotDatasource } from './src/infrastructure/TimeSlotDatasource.js';

const parisTimezone = 'Europe/Paris';

main();

async function main() {
  const reservationController = await getReservationController();
  CronJob.from({
    cronTime: config.cronTime,
    onTick: async () => {
      logger.info('Start job');
      await reservationController.handleReservations();
      logger.info('End job');
    },
    start: true,
    timeZone: parisTimezone,
  });
}

async function getReservationController() {
  const gymlibImapClient = new ImapClient(config.gymlib.imapConfig);
  const handleNewReservationUseCase = new HandleNewReservationUseCase({
    imapClient: gymlibImapClient,
    searchQuery: config.gymlib.searchQuery,
  });

  const getActiveReservationsUseCase = new GetActiveReservationsUseCase({
    reservationRepository,
  });

  const browser = await Browser.create();
  const submitFormUseCase = new SubmitFormUseCase({
    browser,
    reservationRepository,
    formInfo: config.ucpa.formInfo,
    dryRun: !config.ucpa.formSubmit,
  });

  const ucpaImapClient = new ImapClient(config.ucpa.imapConfig);
  const timeSlotDatasource = new TimeSlotDatasource();
  const notificationClient = new NotificationClient(config.notification);
  const notifyUseCase = new NotifyUseCase({
    imapClient: ucpaImapClient,
    searchQuery: config.ucpa.searchQuery,
    reservationRepository,
    timeSlotDatasource,
    notificationClient,
    timeSlotsPreferences: config.timeSlotsPreferences,
    areaId: config.ucpa.areaId,
  });

  return new ReservationController({
    handleNewReservationUseCase,
    getActiveReservationsUseCase,
    submitFormUseCase,
    notifyUseCase,
    logger,
  });
}

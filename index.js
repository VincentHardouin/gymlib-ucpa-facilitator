import { CronJob } from 'cron';

import { config } from './config.js';

import { createServer } from './server.js';
import { ReservationController } from './src/application/ReservationController.js';
import { CreateReservationEventsUseCase } from './src/domain/usecases/CreateReservationEventsUseCase.js';
import { GetActiveReservationsUseCase } from './src/domain/usecases/GetActiveReservationsUseCase.js';
import { GetAllEventsUseCase } from './src/domain/usecases/GetAllEventsUseCase.js';
import { HandleNewReservationUseCase } from './src/domain/usecases/HandleNewReservationUseCase.js';
import { HandleScheduledReservationUseCase } from './src/domain/usecases/HandleScheduledReservationUseCase.js';
import { NotifyUseCase } from './src/domain/usecases/NotifyUseCase.js';
import { SubmitFormUseCase } from './src/domain/usecases/SubmitFormUseCase.js';
import { Browser } from './src/infrastructure/Browser.js';
import { CalendarRepository } from './src/infrastructure/CalendarRepository.js';
import { ImapClient } from './src/infrastructure/ImapClient.js';
import { logger } from './src/infrastructure/logger.js';
import { NotificationClient } from './src/infrastructure/NotificationClient.js';
import { reservationRepository } from './src/infrastructure/ReservationRepository.js';
import { TimeSlotDatasource } from './src/infrastructure/TimeSlotDatasource.js';
import {HandleNextReservationUseCase} from './src/domain/usecases/HandleNextReservationUseCase.js';

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
  const server = await createServer({ reservationController });
  await server.start();
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

  const handleScheduledReservationUseCase = new HandleScheduledReservationUseCase({
    imapClient: ucpaImapClient,
    searchQuery: config.ucpa.searchQuery,
    reservationRepository,
  });

  const calendarRepository = new CalendarRepository(config.calendar.name);

  const createReservationEventsUseCase = new CreateReservationEventsUseCase({
    reservationRepository,
    calendarRepository,
  });

  const getAllEventsUseCase = new GetAllEventsUseCase({ calendarRepository });

  const handleNextReservationUseCase = new HandleNextReservationUseCase({
    reservationRepository,
    passRepository,
  })

  return new ReservationController({
    handleNewReservationUseCase,
    getActiveReservationsUseCase,
    submitFormUseCase,
    notifyUseCase,
    handleScheduledReservationUseCase,
    createReservationEventsUseCase,
    getAllEventsUseCase,
    handleNextReservationUseCase,
    logger,
  });
}

import { config } from '../../../config.js';
import { Browser } from '../../infrastructure/Browser.js';
import { CalendarRepository } from '../../infrastructure/CalendarRepository.js';
import { deviceRepository } from '../../infrastructure/DeviceRepository.js';
import { ImapClient } from '../../infrastructure/ImapClient.js';
import { NotificationClient } from '../../infrastructure/NotificationClient.js';
import { passRepository } from '../../infrastructure/PassRepository.js';
import { registrationRepository } from '../../infrastructure/RegistrationRepository.js';
import { reservationRepository } from '../../infrastructure/ReservationRepository.js';
import { TimeSlotDatasource } from '../../infrastructure/TimeSlotDatasource.js';
import { CreateReservationEventsUseCase } from './CreateReservationEventsUseCase.js';
import { GetActiveReservationsUseCase } from './GetActiveReservationsUseCase.js';
import { GetAllEventsUseCase } from './GetAllEventsUseCase.js';
import { HandleNewReservationUseCase } from './HandleNewReservationUseCase.js';
import { HandleNextReservationUseCase } from './HandleNextReservationUseCase.js';
import { HandleScheduledReservationUseCase } from './HandleScheduledReservationUseCase.js';
import { NotifyUseCase } from './NotifyUseCase.js';
import { CreatePassUseCase } from './passes/CreatePassUseCase.js';
import { FindUpdatablePassesUseCase } from './passes/FindUpdatablePassesUseCase.js';
import { GetUpdatedPassUseCase } from './passes/GetUpdatedPassUseCase.js';
import { RegisterPassUpdateUseCase } from './passes/RegisterPassUpdateUseCase.js';
import { UnregisterPassUpdateUseCase } from './passes/UnregisterPassUpdateUseCase.js';
import { SubmitFormUseCase } from './SubmitFormUseCase.js';

const registerPassUpdateUseCase = new RegisterPassUpdateUseCase({
  deviceRepository,
  registrationRepository,
  passRepository,
});
const unregisterPassUpdateUseCase = new UnregisterPassUpdateUseCase({
  registrationRepository,
  deviceRepository,
});
const findUpdatablePassesUseCase = new FindUpdatablePassesUseCase({
  passRepository,
  registrationRepository,
});
const getUpdatedPassUseCase = new GetUpdatedPassUseCase({
  reservationRepository,
  passRepository,
});
const createPassUseCase = new CreatePassUseCase({
  passRepository,
  reservationRepository,
  config: config.pass,
});

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
});

export {
  createPassUseCase,
  createReservationEventsUseCase,
  findUpdatablePassesUseCase,
  getActiveReservationsUseCase,
  getAllEventsUseCase,
  getUpdatedPassUseCase,
  handleNewReservationUseCase,
  handleNextReservationUseCase,
  handleScheduledReservationUseCase,
  notifyUseCase,
  registerPassUpdateUseCase,
  submitFormUseCase,
  unregisterPassUpdateUseCase,
};

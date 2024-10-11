import { config } from '../../../config.js';
import { BrowserAdapter } from '../../infrastructure/adapters/BrowserAdapter.js';
import { MailAdapter } from '../../infrastructure/adapters/MailAdapter.js';
import { ntfyAdapter } from '../../infrastructure/adapters/NtfyAdapter.js';
import { CalendarRepository } from '../../infrastructure/repositories/CalendarRepository.js';
import { deviceRepository } from '../../infrastructure/repositories/DeviceRepository.js';
import { passRepository } from '../../infrastructure/repositories/PassRepository.js';
import { registrationRepository } from '../../infrastructure/repositories/RegistrationRepository.js';
import { reservationRepository } from '../../infrastructure/repositories/ReservationRepository.js';
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
  config: config.apple,
});

const gymlibMailAdapter = new MailAdapter(config.gymlib.imapConfig);
const handleNewReservationUseCase = new HandleNewReservationUseCase({
  mailAdapter: gymlibMailAdapter,
  searchQuery: config.gymlib.searchQuery,
});

const getActiveReservationsUseCase = new GetActiveReservationsUseCase({
  reservationRepository,
});

const browserAdapter = await BrowserAdapter.create();
const submitFormUseCase = new SubmitFormUseCase({
  browserAdapter,
  reservationRepository,
  formInfo: config.ucpa.formInfo,
  dryRun: !config.ucpa.formSubmit,
});

const ucpaMailAdapter = new MailAdapter(config.ucpa.imapConfig);
const timeSlotDatasource = new TimeSlotDatasource();
const notifyUseCase = new NotifyUseCase({
  mailAdapter: ucpaMailAdapter,
  searchQuery: config.ucpa.searchQuery,
  reservationRepository,
  timeSlotDatasource,
  notificationAdapter: ntfyAdapter,
  timeSlotsPreferences: config.timeSlotsPreferences,
  areaId: config.ucpa.areaId,
});

const handleScheduledReservationUseCase = new HandleScheduledReservationUseCase({
  mailAdapter: ucpaMailAdapter,
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

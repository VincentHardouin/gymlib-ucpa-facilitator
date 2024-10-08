import {
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
} from '../domain/usecases/index.js';
import { logger } from '../infrastructure/Logger.js';
import { passAdapter } from '../infrastructure/PassAdapter.js';
import { PassController } from './PassController.js';
import { ReservationController } from './ReservationController.js';

const passController = new PassController({
  registerPassUpdateUseCase,
  unregisterPassUpdateUseCase,
  findUpdatablePassesUseCase,
  getUpdatedPassUseCase,
  createPassUseCase,
  passAdapter,
  logger,
});

const reservationController = new ReservationController({
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

export {
  passController,
  reservationController,
};

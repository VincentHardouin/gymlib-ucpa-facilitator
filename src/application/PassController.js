import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import { UnableToCreatePassError } from '../domain/Errors.js';

dayjs.extend(utc);

export class PassController {
  constructor({
    registerPassUpdateUseCase,
    unregisterPassUpdateUseCase,
    getUpdatedPassUseCase,
    findUpdatablePassesUseCase,
    createPassUseCase,
    passAdapter,
    logger,
  }) {
    this.registerPassUpdateUseCase = registerPassUpdateUseCase;
    this.unregisterPassUpdateUseCase = unregisterPassUpdateUseCase;
    this.getUpdatedPassUseCase = getUpdatedPassUseCase;
    this.findUpdatablePassesUseCase = findUpdatablePassesUseCase;
    this.createPassUseCase = createPassUseCase;
    this.passAdapter = passAdapter;
    this.logger = logger;
  }

  async register(request, h) {
    const { deviceLibraryIdentifier, passTypeIdentifier, serialNumber } = request.params;
    const { pushToken } = request.payload;
    const { creation } = await this.registerPassUpdateUseCase.execute({ deviceLibraryIdentifier, passTypeIdentifier, serialNumber, pushToken });
    if (creation) {
      return h.response().code(201);
    }
    return h.response().code(200);
  }

  async unregister(request, h) {
    const { deviceLibraryIdentifier, passTypeIdentifier, serialNumber } = request.params;
    await this.unregisterPassUpdateUseCase.execute({ deviceLibraryIdentifier, passTypeIdentifier, serialNumber });
    return h.response().code(200);
  }

  async findUpdatable(request, h) {
    const { deviceLibraryIdentifier, passTypeIdentifier } = request.params;
    const { passesUpdatedSince } = request.query;

    const { serialNumbers, lastUpdated } = await this.findUpdatablePassesUseCase.execute({ deviceLibraryIdentifier, passTypeIdentifier, passesUpdatedSince });

    if (serialNumbers.length === 0) {
      return h.response().code(204);
    }
    return h.response({ serialNumbers, lastUpdated: `${dayjs(lastUpdated).unix()}` }).code(200);
  }

  async log(request, h) {
    this.logger.error(request.payload.logs);
    return h.response().code(200);
  }

  async getUpdated(request, h) {
    const { passTypeIdentifier, serialNumber } = request.params;
    const updatedReservationPass = await this.getUpdatedPassUseCase.execute({ passTypeIdentifier, serialNumber });
    const pass = await this.passAdapter.get(updatedReservationPass);
    const lastUpdated = dayjs(updatedReservationPass.updatedAt).utc().format('ddd, DD, MMM, YYYY HH:mm:ss');
    return h.response(pass).code(200).type('application/vnd.apple.pkpass').header('Last-Updated', `${lastUpdated} GMT`);
  }

  async create(request, h) {
    try {
      const reservationPass = await this.createPassUseCase.execute();
      const pass = await this.passAdapter.get(reservationPass);
      return h.response(pass).code(201).type('application/vnd.apple.pkpass');
    }
    catch (e) {
      if (e instanceof UnableToCreatePassError) {
        return h.response('Unable to create a pass as there are no upcoming events').code(503);
      }
      throw e;
    }
  }
}

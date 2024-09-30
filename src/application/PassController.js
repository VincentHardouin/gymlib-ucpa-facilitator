import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';

dayjs.extend(utc);

export class PassController {
  constructor({
    registerPassUpdateUseCase,
    unregisterPassUpdateUseCase,
    getUpdatedPassUseCase,
    findUpdatablePassesUseCase,
    passAdapter,
    logger,
  }) {
    this.registerPassUpdateUseCase = registerPassUpdateUseCase;
    this.unregisterPassUpdateUseCase = unregisterPassUpdateUseCase;
    this.getUpdatedPassUseCase = getUpdatedPassUseCase;
    this.findUpdatablePassesUseCase = findUpdatablePassesUseCase;
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
    return h.response({ serialNumbers, lastUpdated }).code(200);
  }

  async getUpdated(request, h) {
    const { passTypeIdentifier, serialNumber } = request.params;
    const updatedReservationPass = await this.getUpdatedPassUseCase.execute({ passTypeIdentifier, serialNumber });
    const pass = await this.passAdapter.get(updatedReservationPass);
    const lastUpdated = dayjs(updatedReservationPass.updatedAt).utc().format('ddd, DD, MMM, YYYY HH:mm:ss');
    return h.response(pass).code(200).type('application/vnd.apple.pkpass').header('Last-Updated', `${lastUpdated} GMT`);
  }
}

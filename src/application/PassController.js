export class PassController {
  constructor({
    registerPassUpdateUseCase,
    unregisterPassUpdateUseCase,
    getUpdatedPassUseCase,
    findUpdatablePassesUseCase,
    logger,
  }) {
    this.registerPassUpdateUseCase = registerPassUpdateUseCase;
    this.unregisterPassUpdateUseCase = unregisterPassUpdateUseCase;
    this.getUpdatedPassUseCase = getUpdatedPassUseCase;
    this.findUpdatablePassesUseCase = findUpdatablePassesUseCase;
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
}

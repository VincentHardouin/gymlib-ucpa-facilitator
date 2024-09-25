import { logger } from './Logger.js';

const plugin = {
  name: 'hapi-pino',
  register: async (server, options) => {
    const logger = options.instance;

    server.ext('onPostStart', async () => {
      logger.info(server.info, 'server started');
    });

    server.ext('onPostStop', async () => {
      logger.info(server.info, 'server stopped');
    });

    server.events.on('log', (event) => {
      logger.info({ tags: event.tags, data: event.data });
    });

    server.events.on('request', (_, event) => {
      if (event.channel !== 'error') {
        return;
      }
      if (event.error) {
        logger.error(
          {
            tags: event.tags,
            err: event.error,
          },
          'request error',
        );
      }
    });

    server.events.on('response', (request) => {
      const info = request.info;

      logger.info(
        {
          queryParams: request.query,
          responseTime:
          (info.completed !== undefined ? info.completed : info.responded)
          - info.received,
          payload: request.auth.isAuthenticated ? request.payload : {},
          req: request,
          res: request.raw.res,
        },
        'request completed',
      );
    });
  },
};

const options = {
  instance: logger,
};

export { options, plugin };

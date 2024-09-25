import Hapi from '@hapi/hapi';
import { config } from './config.js';
import * as pino from './src/infrastructure/pino.js';
import { routes } from './src/infrastructure/routes.js';

const createBareServer = function () {
  const serverConfiguration = {
    compression: false,
    debug: { request: false, log: false },
    routes: {
      cors: {
        origin: ['*'],
        additionalHeaders: ['X-Requested-With'],
      },
      response: {
        emptyStatusCode: 204,
      },
    },
    port: config.port,
    router: {
      isCaseSensitive: false,
      stripTrailingSlash: true,
    },
  };

  return Hapi.server(serverConfiguration);
};

async function createServer(controllers) {
  const server = createBareServer();
  await server.register([pino]);
  routes.map(Route => new Route(controllers).register(server));
  return server;
}

export { createServer };

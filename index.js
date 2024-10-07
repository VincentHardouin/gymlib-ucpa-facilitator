import { CronJob } from 'cron';

import { config } from './config.js';
import { createServer } from './server.js';
import { passController, reservationController } from './src/application/index.js';
import { authService } from './src/infrastructure/AuthService.js';
import { logger } from './src/infrastructure/Logger.js';

const parisTimezone = 'Europe/Paris';

main();

async function main() {
  CronJob.from({
    cronTime: config.cronTime,
    onTick: async () => {
      logger.info('Start job');
      await reservationController.handleReservations();
      logger.info('End job');
    },
    start: true,
    runOnInit: true,
    timeZone: parisTimezone,
  });
  const server = await createServer({ reservationController, authService, passController });
  await server.start();
};

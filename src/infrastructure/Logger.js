import * as pino from 'pino';
import { stdSerializers } from 'pino';
import { config } from '../../config.js';

export const logger = pino.default(
  {
    level: config.logging.logLevel,
    redact: ['req.headers.authorization'],
    enabled: config.logging.enabled,
    serializers: Object.assign(Object.create(null), stdSerializers),
  },
);

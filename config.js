import { env } from 'node:process';
import logger from 'imapflow/lib/logger.js';
import 'dotenv/config';

function isFeatureEnabled(environmentVariable) {
  return environmentVariable === 'true';
}

function buildConfiguration() {
  const config = {
    environment: env.NODE_ENV || 'development',
    logging: {
      enabled: isFeatureEnabled(env.LOG_ENABLED),
      logLevel: env.LOG_LEVEL || 'info',
    },
    cronTime: env.CRON_TIME || '* */5 * * * *',
    gymlib: {
      imapConfig: {
        host: env.GYMLIB_MAIL_RECEIVER_IMAP_HOST,
        port: env.GYMLIB_MAIL_RECEIVER_IMAP_PORT,
        user: env.GYMLIB_MAIL_RECEIVER_IMAP_USER,
        password: env.GYMLIB_MAIL_RECEIVER_IMAP_PASSWORD,
      },
      searchQuery: JSON.parse(env.GYMLIB_MAIL_RECEIVER_IMAP_SEARCH_QUERY),
    },
    ucpa: {
      imapConfig: {
        host: env.UCPA_MAIL_RECEIVER_IMAP_HOST,
        port: env.UCPA_MAIL_RECEIVER_IMAP_PORT,
        user: env.UCPA_MAIL_RECEIVER_IMAP_USER,
        password: env.UCPA_MAIL_RECEIVER_IMAP_PASSWORD,
      },
      searchQuery: JSON.parse(env.UCPA_MAIL_RECEIVER_IMAP_SEARCH_QUERY),
      formInfo: JSON.parse(env.FORM_RESPONSE),
      formSubmit: isFeatureEnabled(env.FORM_SUBMIT_ENABLED),
      areaId: env.UCPA_AREA_ID,
    },
    notification: {
      url: env.NOTIFICATION_URL,
      token: env.NOTIFICATION_TOKEN,
    },
    timeSlotsPreferences: JSON.parse(env.TIME_SLOTS_PREFERENCES),
  };
  if (config.environment === 'test') {
    config.logging.enabled = false;
  }

  if (!verifyConfig(config)) {
    throw new Error('Invalid config');
  }
  return config;
}

function verifyConfig(config) {
  let allKeysHaveValues = true;

  function checkDeep(object, path) {
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        const value = object[key];

        const currentPath = path ? `${path}.${key}` : key;

        if (typeof value === 'object' && value !== null) {
          checkDeep(value, currentPath);
        }

        else if (value === null || value === undefined) {
          logger.error(`Key "${currentPath}" does not have a valid value.`);
          allKeysHaveValues = false;
        }
      }
    }
  }

  checkDeep(config, '');

  return allKeysHaveValues;
}

export const config = buildConfiguration();

import { env } from 'node:process';
import 'dotenv/config';

function isFeatureEnabled(environmentVariable) {
  return environmentVariable === 'true';
}

function getParsedJson(environmentVariable) {
  if (environmentVariable === undefined) {
    return undefined;
  }
  return JSON.parse(environmentVariable);
}

function buildConfiguration() {
  const config = {
    environment: env.NODE_ENV || 'development',
    port: env.PORT || 4000,
    baseURL: env.BASE_URL || 'http://example.net',
    secret: env.SECRET,
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
      searchQuery: getParsedJson(env.GYMLIB_MAIL_RECEIVER_IMAP_SEARCH_QUERY),
    },
    ucpa: {
      imapConfig: {
        host: env.UCPA_MAIL_RECEIVER_IMAP_HOST,
        port: env.UCPA_MAIL_RECEIVER_IMAP_PORT,
        user: env.UCPA_MAIL_RECEIVER_IMAP_USER,
        password: env.UCPA_MAIL_RECEIVER_IMAP_PASSWORD,
      },
      searchQuery: getParsedJson(env.UCPA_MAIL_RECEIVER_IMAP_SEARCH_QUERY),
      formInfo: getParsedJson(env.FORM_RESPONSE),
      formSubmit: isFeatureEnabled(env.FORM_SUBMIT_ENABLED),
      areaId: env.UCPA_AREA_ID,
    },
    notifications: {
      ntfy: {
        url: env.NOTIFICATIONS_NTFY_URL,
        token: env.NOTIFICATIONS_NTFY_TOKEN,
        topic: env.NOTIFICATIONS_NTFY_TOPIC,
      },
    },
    calendar: {
      name: env.CALENDAR_NAME,
      id: env.CALENDAR_ID,
    },
    timeSlotsPreferences: getParsedJson(env.TIME_SLOTS_PREFERENCES),
    certificates: {
      signerKeyPassphrase: env.CERTIFICATES_SIGNER_KEY_PASSPHRASE,
    },
    apple: {
      teamIdentifier: env.APPLE_TEAM_IDENTIFIER,
      passTypeIdentifier: env.APPLE_PASS_TYPE_IDENTIFIER,
    },
    browser: {
      browserWSEndpoint: env.BROWSER_WS_ENDPOINT,
    },
  };
  if (config.environment === 'test') {
    config.logging.enabled = false;
    config.secret = 'SECRET_FOR_TESTS';
    config.pass.passTypeIdentifier = 'pass-identifier';
  }

  if (!verifyConfig(config)) {
    throw new Error('Invalid config');
  }
  return config;
}

function verifyConfig(config) {
  if (env.NODE_ENV === 'test') {
    return true;
  }

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
          console.error(`Key "${currentPath}" does not have a valid value.`);
          allKeysHaveValues = false;
        }
      }
    }
  }

  checkDeep(config, '');

  return allKeysHaveValues;
}

export const config = buildConfiguration();

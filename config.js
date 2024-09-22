import { env } from 'node:process';

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
    },
    notification: {
      url: env.NOTFICATION_URL,
      token: env.NOTFICATION_TOKEN,
    },
    timeSlotsPreferences: JSON.parse(env.TIME_SLOTS_PREFERENCES),
  };
  if (config.environment === 'test') {
    config.logging.enabled = false;
  }
  return config;
}

export const config = buildConfiguration();

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
  };
  if (config.environment === 'test') {
    config.logging.enabled = false;
  }
  return config;
}

export const config = buildConfiguration();

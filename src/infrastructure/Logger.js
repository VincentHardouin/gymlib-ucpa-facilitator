class Logger {
  info(msg) {
    // eslint-disable-next-line no-console
    console.info(msg);
  }

  error(msg) {
    console.error(msg);
  }
}

export const logger = new Logger();

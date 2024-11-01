import { config } from '../../../config.js';
import { logger } from '../Logger.js';
import { httpAdapter } from './HttpAdapter.js';
import { jsonWebTokenAdapter } from './JsonWebTokenAdapter.js';
import { NotificationAdapter } from './NotificationAdapter.js';

export class ApnAdapter extends NotificationAdapter {
  constructor({ url, topic, jsonWebTokenAdapter, httpAdapter, logger }) {
    super();
    this.url = url;
    this.topic = topic;
    this.jsonWebTokenAdapter = jsonWebTokenAdapter;
    this.httpAdapter = httpAdapter;
    this.logger = logger;
  }

  async notify(pushToken) {
    const token = await this._getToken();
    const headers = {
      'Authorization': `Bearer ${token}`,
      'apns-topic': this.topic,
    };
    const url = `${this.url}/3/device/${pushToken}`;
    this.logger.debug(`Notify device ${pushToken}`);
    return this.httpAdapter.post(url, headers, {});
  }

  _getToken() {
    if (!this.token || this._isTokenExpired(this.token)) {
      this.token = jsonWebTokenAdapter.generateAppleToken();
    }
    return this.token;
  }

  _isTokenExpired(token) {
    if (!token) {
      return true;
    }
    const now = Math.floor(Date.now() / 1000);
    const decodedToken = jsonWebTokenAdapter.getDecodedTokenWithoutVerification(token);

    if (!decodedToken || !decodedToken.iat) {
      return true;
    }

    return (now - decodedToken.iat) > 3500; // On renouvèle avant une heure
  }
}

export const apnAdapter = new ApnAdapter({
  ...config.notifications.apple,
  jsonWebTokenAdapter,
  httpAdapter,
  logger,
});

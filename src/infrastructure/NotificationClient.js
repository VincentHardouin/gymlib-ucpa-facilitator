import { httpAdapter } from './adapters/HttpAdapter.js';

export class NotificationClient {
  constructor({ url, token }) {
    this.url = url;
    this.token = token;
  }

  async notify(text) {
    await httpAdapter.post(this.url, { Authorization: this.token }, text);
  }
}

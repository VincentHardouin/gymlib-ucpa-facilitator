import { httpAdapter } from './HttpAdapter.js';

export class NotificationAdapter {
  constructor({ url, token }) {
    this.url = url;
    this.token = token;
  }

  async notify(text) {
    await httpAdapter.post(this.url, { Authorization: this.token }, text);
  }
}

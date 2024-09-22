import { httpClient } from './HttpClient.js';

export class NotificationClient {
  constructor({ url, token }) {
    this.url = url;
    this.token = token;
  }

  async notify(text) {
    await httpClient.post(this.url, { Authorization: this.token }, text);
  }
}

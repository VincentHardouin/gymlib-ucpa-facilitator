import { config } from '../../../config.js';
import { httpAdapter } from './HttpAdapter.js';
import { NotificationAdapter } from './NotificationAdapter.js';

export class NtfyAdapter extends NotificationAdapter {
  constructor({ url, token, topic, httpAdapter }) {
    super();
    this.url = url;
    this.token = token;
    this.topic = topic;
    this.httpAdapter = httpAdapter;
  }

  async notify(text) {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };
    const body = {
      topic: this.topic,
      message: text,
    };
    return this.httpAdapter.post(this.url, headers, body);
  }
}

export const ntfyAdapter = new NtfyAdapter({
  ...config.notifications.ntfy,
  httpAdapter,
});

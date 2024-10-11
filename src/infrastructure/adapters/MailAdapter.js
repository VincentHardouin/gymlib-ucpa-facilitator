import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import { logger } from '../Logger.js';

class MailAdapter {
  #host;
  #port;
  #user;
  #password;

  constructor({ host, port, user, password }) {
    this.#host = host;
    this.#port = port;
    this.#user = user;
    this.#password = password;
  }

  async getConnectedClient() {
    const client = new ImapFlow({
      host: this.#host,
      port: this.#port,
      secure: true,
      auth: {
        user: this.#user,
        pass: this.#password,
      },
      logger: false,
    });
    await client.connect();
    return client;
  }

  async fetch(searchQuery) {
    const client = await this.getConnectedClient();
    const lock = await client.getMailboxLock('INBOX');
    const messages = [];
    try {
      for await (const message of client.fetch(searchQuery, {
        source: true,
        headers: ['date', 'subject'],
      })) {
        const mail = await simpleParser(message.source);
        messages.push({
          uid: message.uid,
          date: mail.date,
          title: mail.subject,
          html: mail.html,
          text: mail.text,
        });
      }
    }
    finally {
      lock.release();
    }
    await client.logout();
    return messages;
  }

  async deleteMail(uid) {
    logger.info({ uid });
    const client = await this.getConnectedClient();
    logger.info('connected');
    const lock = await client.getMailboxLock('INBOX');
    logger.info({ uid });
    try {
      await client.messageDelete({ uid }, { uid: true });
    }
    finally {
      lock.release();
    }
    await client.logout();
  }
}

export { MailAdapter };

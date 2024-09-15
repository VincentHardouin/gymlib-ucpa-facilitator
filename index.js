import { env } from 'node:process';
import { ImapClient } from './ImapClient.js';

import 'dotenv/config';

const imapConfig = {
  host: env.IMAP_HOST,
  port: env.IMAP_PORT,
  user: env.IMAP_USER,
  password: env.IMAP_PASSWORD,
};

const client = new ImapClient(imapConfig);
const searchQuery = JSON.parse(env.IMAP_SEARCH_QUERY);
const messages = await client.fetch(searchQuery);
for (const message of messages) {
  console.log({ message });
}

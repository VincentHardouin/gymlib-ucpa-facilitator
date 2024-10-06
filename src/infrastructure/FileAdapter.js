import * as fs from 'node:fs/promises';
import { logger } from './Logger.js';

class FileAdapter {
  constructor({ fs, logger }) {
    this.fs = fs;
    this.logger = logger;
  }

  async readFile(filePath) {
    try {
      await this.fs.access(filePath, this.fs.constants.F_OK | this.fs.constants.R_OK);

      const data = await this.fs.readFile(filePath, 'utf8');
      return data;
    }
    catch (err) {
      if (err.code === 'ENOENT') {
        this.logger.error('Error: File does not exist');
      }
      else if (err.code === 'EACCES') {
        this.logger.error('Error: No permission to read the file');
      }
      else {
        this.logger.error('Error reading file:', err);
      }
      throw err;
    }
  }
}

export const fileAdapter = new FileAdapter({ fs, logger });

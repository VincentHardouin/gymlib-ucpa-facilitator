import { resolve } from 'node:path';
import { config } from '../../config.js';
import { fileAdapter } from './FileAdapter.js';

class CertificatesAdapter {
  constructor({ signerKeyPassphrase, fileAdapter }) {
    this.fileAdapter = fileAdapter;
    this.signerKeyPassphrase = signerKeyPassphrase;
    this.cache = null;
  }

  async getForPass() {
    if (this.cache !== null) {
      return this.cache;
    }

    const signerCert = await this.fileAdapter.readFile(resolve(import.meta.dirname, '../../certs/signerCert.pem'));
    const signerKey = await this.fileAdapter.readFile(resolve(import.meta.dirname, '../../certs/signerKey.pem'));
    const wwdr = await this.fileAdapter.readFile(resolve(import.meta.dirname, '../../certs/wwdr.pem'));

    this.cache = {
      signerCert,
      signerKey,
      wwdr,
      signerKeyPassphrase: this.signerKeyPassphrase,
    };

    return this.cache;
  }
}

export const certificatesAdapter = new CertificatesAdapter({
  signerKeyPassphrase: config.certificates.signerKeyPassphrase,
  fileAdapter,
});

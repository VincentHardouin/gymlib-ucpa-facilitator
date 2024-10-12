import { resolve } from 'node:path';
import { config } from '../../../config.js';
import { fileAdapter } from './FileAdapter.js';

class CertificatesAdapter {
  constructor({ signerKeyPassphrase, fileAdapter }) {
    this.fileAdapter = fileAdapter;
    this.signerKeyPassphrase = signerKeyPassphrase;
    this.cache = {};
  }

  async getForPass() {
    if (this.cache.pass !== undefined) {
      return this.cache.pass;
    }

    const signerCert = await this.fileAdapter.readFile(resolve(import.meta.dirname, '../../../certs/signerCert.pem'));
    const signerKey = await this.fileAdapter.readFile(resolve(import.meta.dirname, '../../../certs/signerKey.pem'));
    const wwdr = await this.fileAdapter.readFile(resolve(import.meta.dirname, '../../../certs/wwdr.pem'));

    this.cache.pass = {
      signerCert,
      signerKey,
      wwdr,
      signerKeyPassphrase: this.signerKeyPassphrase,
    };

    return this.cache.pass;
  }

  async getForAppleToken() {
    if (this.cache.appleTokenCertificate !== undefined) {
      return this.cache.appleTokenCertificate;
    }

    const appleTokenCertificate = await this.fileAdapter.readFile(resolve(import.meta.dirname, '../../../certs/AuthKey_N7J7Y44RJQ.p8'));
    this.cache.appleTokenCertificate = appleTokenCertificate;
    return this.cache.appleTokenCertificate;
  }
}

export const certificatesAdapter = new CertificatesAdapter({
  signerKeyPassphrase: config.certificates.signerKeyPassphrase,
  fileAdapter,
});

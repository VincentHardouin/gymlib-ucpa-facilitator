import jsonwebtoken from 'jsonwebtoken';
import { config } from '../../config.js';
import { certificatesAdapter } from './CertificatesAdapter.js';

class JsonWebTokenService {
  constructor({ jsonwebtoken, certificatesAdapter, config }) {
    this.jsonwebtoken = jsonwebtoken;
    this.certificatesAdapter = certificatesAdapter;
    this.config = config;
  }

  async generateToken(passInfo) {
    return this.jsonwebtoken.sign(passInfo, config.secret);
  }

  async generateAppleToken() {
    const appleTokenCert = await this.certificatesAdapter.getForAppleToken();
    return this.jsonwebtoken.sign({}, appleTokenCert, { algorithm: 'ES256', issuer: config.apple.teamIdentifier, keyid: 'N7J7Y44RJQ' });
  }

  extractTokenFromHeader(request) {
    if (!request.headers.authorization) {
      return '';
    }
    const authorizationHeader = request.headers.authorization;
    if (!authorizationHeader) {
      return '';
    }
    else if (!authorizationHeader.startsWith('Bearer ') && !authorizationHeader.startsWith('ApplePass ')) {
      return '';
    }
    return authorizationHeader.replace('Bearer ', '').replace('ApplePass ', '');
  }

  extractTokenFromQuery(request) {
    if (!request.query.token) {
      return '';
    }

    return request.query.token;
  }

  getDecodedToken(token) {
    try {
      return this.jsonwebtoken.verify(token, config.secret);
    }
    catch {
      return null;
    }
  }
}

export const jsonWebTokenService = new JsonWebTokenService({
  jsonwebtoken,
  certificatesAdapter,
  config: {
    authentification: config.authentication,
    apple: config.apple,
  },
});

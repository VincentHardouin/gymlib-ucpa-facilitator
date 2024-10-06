import jsonwebtoken from 'jsonwebtoken';
import { config } from '../../config.js';

class JsonWebTokenService {
  constructor(jsonwebtoken, config) {
    this.jsonwebtoken = jsonwebtoken;
    this.config = config;
  }

  async generateToken(passInfo) {
    return this.jsonwebtoken.sign(passInfo, config.secret);
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

export const jsonWebTokenService = new JsonWebTokenService(jsonwebtoken, config.authentication);

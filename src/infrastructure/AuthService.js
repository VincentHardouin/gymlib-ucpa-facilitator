import * as boom from '@hapi/boom';
import { jsonWebTokenAdapter } from './adapters/JsonWebTokenAdapter.js';

class AuthService {
  constructor({ jsonWebTokenAdapter }) {
    this.jsonWebTokenAdapter = jsonWebTokenAdapter;
  }

  validateFromPass(request, h) {
    const accessTokenFromHeader = this.jsonWebTokenAdapter.extractTokenFromHeader(request);
    const accessTokenFromQuery = this.jsonWebTokenAdapter.extractTokenFromQuery(request);

    const accessToken = accessTokenFromHeader !== '' ? accessTokenFromHeader : accessTokenFromQuery;

    if (!accessToken) {
      return boom.unauthorized('Invalid token');
    }

    const decodedAccessToken = this.jsonWebTokenAdapter.getDecodedToken(accessToken);
    if (!decodedAccessToken) {
      return boom.unauthorized('Invalid token');
    }

    return h.response(true);
  }
}

export const authService = new AuthService({ jsonWebTokenAdapter });

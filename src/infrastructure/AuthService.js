import * as boom from '@hapi/boom';
import { jsonWebTokenService } from './JsonWebTokenService.js';

class AuthService {
  constructor(jsonWebTokenService) {
    this.jsonWebTokenService = jsonWebTokenService;
  }

  validateFromPass(request, h) {
    const accessTokenFromHeader = this.jsonWebTokenService.extractTokenFromHeader(request);
    const accessTokenFromQuery = this.jsonWebTokenService.extractTokenFromQuery(request);

    const accessToken = accessTokenFromHeader !== '' ? accessTokenFromHeader : accessTokenFromQuery;

    if (!accessToken) {
      return boom.unauthorized('Invalid token');
    }

    const decodedAccessToken = this.jsonWebTokenService.getDecodedToken(accessToken);
    if (!decodedAccessToken) {
      return boom.unauthorized('Invalid token');
    }

    return h.response(true);
  }
}

export const authService = new AuthService(jsonWebTokenService);

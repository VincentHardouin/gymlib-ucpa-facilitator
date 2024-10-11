import * as chai from 'chai';
import nock from 'nock';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { jsonWebTokenAdapter } from '../src/infrastructure/adapters/JsonWebTokenAdapter.js';

const expect = chai.expect;
chai.use(sinonChai);

// eslint-disable-next-line mocha/no-top-level-hooks
beforeEach(function () {
  nock.disableNetConnect();
});

// eslint-disable-next-line mocha/no-top-level-hooks
afterEach(function () {
  sinon.restore();
  nock.cleanAll();
});

async function generateAuthorizationToken() {
  const token = await jsonWebTokenAdapter.generateToken({ serialNumber: '123456' });
  return `ApplePass ${token}`;
}

// eslint-disable-next-line mocha/no-exports
export {
  expect,
  generateAuthorizationToken,
  nock,
  sinon,
};

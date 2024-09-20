import * as chai from 'chai';
import nock from 'nock';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';

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

// eslint-disable-next-line mocha/no-exports
export {
  expect,
  nock,
  sinon,
};

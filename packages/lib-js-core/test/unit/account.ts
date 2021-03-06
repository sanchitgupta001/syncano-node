import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import * as nock from 'nock'
import Server from '../../src'
import {AccountClass} from '../../src/account'

chai.use(chaiAsPromised)
chai.should()

describe('Account', () => {
  const instanceName = 'testInstance'
  let api: nock.Scope
  let account: AccountClass

  beforeEach(() => {
    const server = new Server({
      token: 'testKey',
      instanceName
    })
    account = server.account
    api = nock(`https://${process.env.SYNCANO_HOST || 'api.syncano.io'}`)
  })

  describe('#get', () => {
    it('should fail for invalid account key', () => {
      api
        .matchHeader('x-api-key', 'invalid_key')
        .get(`/v2/account/`)
        .reply(400, {
          detail: 'No such API Key.'
        })

      return account
        .get('invalid_key')
        .should.be.rejectedWith(Error, 'No such API Key.')
    })

    it('should get account with valid account key', () => {
      api
        .matchHeader('x-api-key', 'valid_key')
        .get(`/v2/account/`)
        .reply(200, {
          id: 1
        })

      return account.get('valid_key').should.be.become({
        id: 1
      })
    })
  })

  describe('#login', () => {
    it('should success', () => {
      const params = {email: 'wrong@email', password: 'wrong_password'}
      api
        .post('/v2/account/auth/')
        .reply(200, {})

      return account
        .login(params)
        .should.be.become({})
    })

    it('should fail for invalid email and password', () => {
      const params = {email: 'wrong@email', password: 'wrong_password'}
      api
        .post('/v2/account/auth/')
        .reply(400, {
          detail: 'Invalid user name or password.'
        })

      return account
        .login(params)
        .should.be.rejectedWith(Error, 'Invalid user name or password.')
    })
  })

  describe('#register', () => {
    it('should success', () => {
      const params = {email: 'wrong@email', password: 'wrong_password'}
      api
        .post('/v2/account/register/')
        .reply(200, {})

      return account
        .register(params)
        .should.be.become({})
    })

    it('should reject when response != 200', () => {
      const params = {email: 'wrong@email', password: 'wrong_password'}
      api
        .post('/v2/account/register/')
        .reply(400)

      return account
        .register(params)
        .should.be.rejectedWith(Error, 'Bad Request')
    })
  })
})

import { expect } from 'chai'
import CustomApi from 'binary-common-utils/lib/customApi'
import Observer from 'binary-common-utils/lib/observer'
import WebSocket from 'ws'
import JSI from '../JSI'

jasmine.DEFAULT_TIMEOUT_INTERVAL = 18000 * 2

const observer = new Observer()
const api = (new CustomApi(observer, null, null, new WebSocket(
  process.env.ENDPOINT ||
    'wss://ws.binaryws.com/websockets/v3?l=en&app_id=0')))
const $scope = { observer, api }

const jsi = new JSI($scope)

describe('Run JSI over bot', () => {
  let value

  beforeAll(done => {
    jsi.run(`
      (function (){
        Bot.start('Xkq6oGFEHh6hJH8',
        {
          amount: 1, basis: 'stake', candleInterval: 60,
          contractTypes: '["CALL","PUT"]',
          currency: 'USD', duration: 2,
          duration_unit: 'h', symbol: 'R_100',
        }
        );
        var context
        while (testScope(context = watch('before'), 'before')) {
          Bot.purchase('CALL')
        }
        while (testScope(context = watch('during'), 'during')) {
          Bot.sellAtMarket();
        }
        return isInside('after')
      })();
    `).then(v => {
      value = v
      done()
    })
  })
  it('return code is correct', () => {
    expect(value).to.be.equal(true)
  })
})
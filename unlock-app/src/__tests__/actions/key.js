import { purchaseKey, setKey, PURCHASE_KEY, SET_KEY } from '../../actions/key'

describe('key actions', () => {

  it('should create an action to purchase a key', () => {
    const lock = {}
    const account = '0x123'
    const expectedAction = {
      type: PURCHASE_KEY,
      lock,
      account,
    }
    expect(purchaseKey(lock, account)).toEqual(expectedAction)
  })

  it('should create an action to set the key', () => {
    const key = {
      expiration: 100,
      data: 'hello',
    }
    const expectedAction = {
      type: SET_KEY,
      key,
    }
    expect(setKey(key)).toEqual(expectedAction)
  })

})

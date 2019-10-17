import { purchaseKey, setKey, PURCHASE_KEY, SET_KEY } from '../../actions/key'

describe('key actions', () => {
  it('should create an action to purchase a key', () => {
    expect.assertions(1)
    const key = {}
    const expectedAction = {
      type: PURCHASE_KEY,
      key,
    }
    expect(purchaseKey(key)).toEqual(expectedAction)
  })

  it('should create an action to set a key to the store', () => {
    expect.assertions(1)
    const id = '123'
    const key = {
      expiration: 100,
      data: 'hello',
      id,
    }
    const expectedAction = {
      type: SET_KEY,
      id,
      key,
    }
    expect(setKey(id, key)).toEqual(expectedAction)
  })
})

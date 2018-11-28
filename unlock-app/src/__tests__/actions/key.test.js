import {
  purchaseKey,
  addKey,
  updateKey,
  PURCHASE_KEY,
  ADD_KEY,
  UPDATE_KEY,
} from '../../actions/key'

describe('key actions', () => {
  it('should create an action to purchase a key', () => {
    const key = {}
    const expectedAction = {
      type: PURCHASE_KEY,
      key,
    }
    expect(purchaseKey(key)).toEqual(expectedAction)
  })

  it('should create an action to add a key to the store', () => {
    const key = {
      expiration: 100,
      data: 'hello',
      id: '123',
    }
    const expectedAction = {
      type: ADD_KEY,
      key,
    }
    expect(addKey(key)).toEqual(expectedAction)
  })

  it('should create an action to update a key in the store', () => {
    const key = {
      expiration: 100,
      data: 'hello',
      id: '123',
    }
    const expectedAction = {
      type: UPDATE_KEY,
      id: key.id,
      update: key,
    }
    expect(updateKey(key.id, key)).toEqual(expectedAction)
  })
})

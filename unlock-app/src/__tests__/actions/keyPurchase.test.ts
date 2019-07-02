import { ADD_TO_CART, addToCart } from '../../actions/keyPurchase'

describe('keyPurchase actions', () => {
  it('should create an action to add a lock to the cart', () => {
    expect.assertions(1)
    const lock = 'a lock'
    const tip = 'a tip'
    expect(addToCart({ lock, tip })).toEqual(
      expect.objectContaining({
        type: ADD_TO_CART,
        lock,
        tip,
      })
    )
  })
})

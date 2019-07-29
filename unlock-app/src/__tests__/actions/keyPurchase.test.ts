import {
  ADD_TO_CART,
  addToCart,
  UPDATE_PRICE,
  updatePrice,
  dismissPurchaseModal,
  DISMISS_PURCHASE_MODAL,
} from '../../actions/keyPurchase'

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

  it('should create an action to update the cart with the price of a key to the lock', () => {
    expect.assertions(1)
    expect(updatePrice(5.5)).toEqual(
      expect.objectContaining({
        type: UPDATE_PRICE,
        price: 5.5,
      })
    )
  })

  it('should create an action to dismiss the modal (e.g., when the X is clicked)', () => {
    expect.assertions(1)
    expect(dismissPurchaseModal()).toEqual({
      type: DISMISS_PURCHASE_MODAL,
    })
  })
})

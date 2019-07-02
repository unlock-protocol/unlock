export const ADD_TO_CART = 'keyPurchase/ADD_TO_CART'

export const addToCart = ({ lock, tip }: any) => ({
  type: ADD_TO_CART,
  lock,
  tip,
})

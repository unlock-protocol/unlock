export const ADD_TO_CART = 'keyPurchase/ADD_TO_CART'
export const UPDATE_PRICE = 'keyPurchase/UPDATE_PRICE'

export const addToCart = ({ lock, tip }: any) => ({
  type: ADD_TO_CART,
  lock,
  tip,
})

export const updatePrice = (price: number) => ({
  type: UPDATE_PRICE,
  price,
})

export const ADD_TO_CART = 'keyPurchase/ADD_TO_CART'
export const UPDATE_PRICE = 'keyPurchase/UPDATE_PRICE'
export const DISMISS_PURCHASE_MODAL = 'keyPurchase/DISMISS_MODAL'

export const addToCart = ({ lock, tip }: any) => ({
  type: ADD_TO_CART,
  lock,
  tip,
})

export const updatePrice = (price: number) => ({
  type: UPDATE_PRICE,
  price,
})

export const dismissPurchaseModal = () => ({
  type: DISMISS_PURCHASE_MODAL,
})

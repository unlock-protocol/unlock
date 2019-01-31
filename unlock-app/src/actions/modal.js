export const SHOW_MODAL = 'modal/SHOW_MODAL'
export const HIDE_MODAL = 'modal/HIDE_MODAL'
export const OPEN_MODAL_IN_NEW_WINDOW = 'modal/OPEN_MODAL_IN_NEW_WINDOW'

export const showModal = modal => ({
  type: SHOW_MODAL,
  modal,
})

export const hideModal = modal => ({
  type: HIDE_MODAL,
  modal,
})

// TODO: this is to be used in a new middleware to open paywall modal in a new window
export const openNewWindowModal = () => ({
  type: OPEN_MODAL_IN_NEW_WINDOW,
})

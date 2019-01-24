export const SHOW_MODAL = 'modal/SHOW_MODAL'
export const HIDE_MODAL = 'modal/HIDE_MODAL'

export const showModal = modal => ({
  type: SHOW_MODAL,
  modal,
})

export const hideModal = modal => ({
  type: HIDE_MODAL,
  modal,
})

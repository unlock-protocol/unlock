export const SHOW_FORM = 'formVisibility/ON'
export const HIDE_FORM = 'formVisibility/OFF'

export const showForm = () => ({
  type: SHOW_FORM,
})

export const hideForm = () => ({
  type: HIDE_FORM,
})

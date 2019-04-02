export const START_LOADING = 'loading/START_LOADING'
export const DONE_LOADING = 'loading/DONE_LOADING'

export const startLoading = () => ({
  type: START_LOADING,
})

export const doneLoading = () => ({
  type: DONE_LOADING,
})

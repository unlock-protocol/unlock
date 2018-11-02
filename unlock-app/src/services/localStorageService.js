/* eslint no-console: 0 */

export const loadState = () => {
  try {
    const serializedState = localStorage.getItem('state')
    if (serializedState === null) {
      return undefined // TODO: warn user
    }
    return JSON.parse(serializedState)
  } catch (err) {
    return undefined // TODO: warn user
  }
}

export const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state)
    localStorage.setItem('state', serializedState)
  } catch (err) {
    console.error(err)
  }
}

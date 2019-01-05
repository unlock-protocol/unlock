import { setNetwork } from '../actions/network'

export function checkNetwork(store) {
  if (!window || !window.web3) return
  window.web3.version.getNetwork().then(id => {
    if (store.getState().network.name !== id) {
      store.dispatch(setNetwork(id))
    }
  })
}

export default store => {
  checkNetwork(store)
  const checkAgain = checkNetwork.bind(null, store)
  setInterval(checkAgain, 1000)
  return next => action => next(action)
}

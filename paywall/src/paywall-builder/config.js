import { PostMessages } from '../messageTypes'

export function sendConfig(config, iframe, origin) {
  const payload = config
  if (!payload) return
  iframe.contentWindow.postMessage(
    {
      type: PostMessages.CONFIG,
      payload,
    },
    origin
  )
}

export function enable(window) {
  return new window.Promise((resolve, reject) => {
    if (!window.web3 || !window.web3.currentProvider) {
      return reject(new ReferenceError('no web3 wallet exists'))
    }
    if (!window.web3.currentProvider.enable) return resolve()
    window.web3.currentProvider
      .enable()
      .then(() => {
        return resolve()
      })
      .catch(e => {
        reject(e)
      })
  })
}

function getAccount(window, iframe, origin) {
  const id = new Date().getTime()
  window.web3.currentProvider.send(
    {
      method: 'eth_accounts',
      params: [],
      jsonrpc: '2.0',
      id,
    },
    (error, result) => {
      if (error) return
      iframe.contentWindow.postMessage(
        { type: PostMessages.ACCOUNT, payload: result.result[0] },
        origin
      )
    }
  )
}
// this listens for the "ready" message from the iframe
export function setupReadyListener(window, iframe, origin) {
  window.addEventListener('message', event => {
    if (event.origin !== origin || event.source !== iframe.contentWindow) {
      // nice try, hackers
      return
    }

    if (event.data === PostMessages.READY) {
      // we were ready first, send the paywall configuration now
      // this script assumes that the metadata is set in a script tag like:
      // <script type="text/javascript">window.unlockProtocolConfig = {...}</script>
      // immediately before paywall.min.js is loaded
      sendConfig(window.unlockProtocolConfig, iframe, origin)
      enable(window)
        .then(() => getAccount(window, iframe, origin))
        .catch(() => {}) // no web3, don't retrieve account
    }
  })
}

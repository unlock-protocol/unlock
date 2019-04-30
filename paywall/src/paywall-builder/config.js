import {
  POST_MESSAGE_READY,
  POST_MESSAGE_CONFIG,
  POST_MESSAGE_ACCOUNT,
} from './constants'

export function sendConfig(config, iframe, origin) {
  const payload = config
  if (!payload) return
  iframe.contentWindow.postMessage(
    {
      type: POST_MESSAGE_CONFIG,
      payload,
    },
    origin
  )
}

// this listens for the "ready" message from the iframe
export function setupReadyListener(window, iframe, origin) {
  window.addEventListener('message', event => {
    if (event.origin !== origin || event.source !== iframe.contentWindow) {
      // nice try, hackers
      return
    }

    if (event.data === POST_MESSAGE_READY) {
      // we were ready first, send the paywall configuration now
      // this script assumes that the metadata is set in a script tag like:
      // <script type="text/javascript">window.unlockConfig = {...}</script>
      // immediately before paywall.min.js is loaded
      sendConfig(window.unlockConfig, iframe, origin)
      if (window.ethereum) {
        window.ethereum.enable().then(() => {
          const id = new Date().getTime()
          window.ethereum.sendAsync(
            {
              method: 'eth_accounts',
              params: [],
              jsonrpc: '2.0',
              id,
            },
            (error, result) => {
              if (error) return
              iframe.contentWindow.postMessage(
                { type: POST_MESSAGE_ACCOUNT, payload: result.result[0] },
                origin
              )
            }
          )
        })
      }
    }
  })
}

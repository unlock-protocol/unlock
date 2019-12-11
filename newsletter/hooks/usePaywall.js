import { useEffect, useState } from 'react'
import configure from '../config'

const config = configure()

export const usePaywall = lockAddresses => {
  const [lockState, setLockState] = useState('loading')

  useEffect(() => {
    if (lockAddresses.length) {
      // Add the Unlock config!
      const unlockConfig = {
        icon:
          'https://staging-app.unlock-protocol.com/static/images/svg/default.svg',
        callToAction: {
          default:
            'Purchase access to the newsletter with crypto! You will need to send two transactions, one to approve the ERC20 transfer, and one for the actual purchase.',
          pending:
            'Your transaction has been sent. As soon as it has been mined, you will receive your Non Fungible Token!',
          confirmed:
            'You already have a key and you will soon receive new emails!',
        },
      }
      unlockConfig.locks = lockAddresses.reduce((locks, lockAddress) => {
        locks[lockAddress] = {}
        return locks
      }, {})
      window.unlockProtocolConfig = unlockConfig

      // And then the Unlock script
      const script = window.document.createElement('script')
      const scriptContent = window.document.createTextNode(`(function(d, s) {
var js = d.createElement(s),
sc = d.getElementsByTagName(s)[0];
js.src="${config.paywallUrl}/static/unlock.1.0.min.js";
sc.parentNode.insertBefore(js, sc); }(document, "script"));`)
      script.appendChild(scriptContent)
      window.document.body.appendChild(script)

      // Set the lock state, based on the event
      const handler = event => {
        setLockState(event.detail)
      }
      window.addEventListener('unlockProtocol', handler)

      // Cleanup
      return () => {
        window.removeEventListener('unlockProtocol', handler)
        window.document.body.removeChild(script)
        delete window.unlockProtocolConfig
      }
    }
  }, [lockAddresses])

  return lockState
}

export default usePaywall

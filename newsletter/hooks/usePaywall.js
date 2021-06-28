import { useEffect, useState } from 'react'
import configure from '../config'

const config = configure()

export const usePaywall = (lockAddresses) => {
  const [lockState, setLockState] = useState('loading')

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)

    if (lockAddresses.length) {
      // Each lock migth start with the network name!
      // Add the Unlock config!
      const unlockConfig = {
        network: 1, // Deprecated
        icon:
          urlParams.icon ||
          'https://app.unlock-protocol.com/static/images/svg/default.svg',
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
        const [network, address] = lockAddress.split('0x')
        // eslint-disable-next-line no-param-reassign
        locks[`0x${address}`] = {
          network: network ? parseInt(network, 10) : 1,
        }
        return locks
      }, {})

      unlockConfig.metadataInputs = [
        {
          name: 'Email Address',
          type: 'email',
          required: true,
        },
      ]
      window.unlockProtocolConfig = unlockConfig

      // And then the Unlock script
      const script = window.document.createElement('script')
      const scriptContent = window.document.createTextNode(`(function(d, s) {
var js = d.createElement(s),
sc = d.getElementsByTagName(s)[0];
js.src="${config.paywallUrl}/static/unlock.latest.min.js";
sc.parentNode.insertBefore(js, sc); }(document, "script"));`)
      script.appendChild(scriptContent)
      window.document.body.appendChild(script)

      // Set the lock state, based on the event
      const handler = (event) => {
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
    // No-op when there are no lock addresses
    return () => {}
  }, [JSON.stringify(lockAddresses)])

  return [lockState]
}

export default usePaywall

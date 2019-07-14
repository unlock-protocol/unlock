import { waitFor } from '../../utils/promises'
import { getAccount } from './account'

export default async function ensureWalletReady(walletService) {
  return new Promise((resolve, reject) => {
    if (!walletService) {
      return reject(
        new Error(
          'initialize walletService before retrieving data or sending transactions'
        )
      )
    }
    if (walletService.ready) {
      waitFor(getAccount).then(resolve)
    }
    walletService.once('ready', async () => {
      // make sure our account listener has had time to retrieve it
      // before we declare the wallet ready
      await waitFor(getAccount)
      resolve()
    })
  })
}

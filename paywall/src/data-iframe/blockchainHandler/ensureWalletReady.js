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
      resolve()
    } else {
      walletService.once('ready', () => {
        resolve()
      })
    }
  })
}

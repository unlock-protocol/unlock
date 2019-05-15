export default async function ensureWalletReady(walletService) {
  let waiting = true
  return new Promise((resolve, reject) => {
    if (!walletService) {
      return reject(
        new Error(
          'initialize walletService before retrieving data or sending transactions'
        )
      )
    }
    if (walletService.ready) {
      return resolve()
    }
    walletService.once('ready', () => {
      if (!waiting) return // timed out
      resolve()
    })
    setTimeout(() => {
      waiting = false
      reject(new Error('connecting to blockchain timed out'))
    }, 10000)
  })
}

import ensureWalletReady from './ensureWalletReady'
import { getAccount } from './account'
import { getNetwork } from './network'

export default async function locksmithTransactions(
  window,
  locksmithHost,
  web3Service
) {
  await ensureWalletReady(window)
  const account = getAccount()
  const network = getNetwork()

  const url = `${locksmithHost}/transactions?sender=${account}`

  const response = await window.fetch(url)
  const result = await response.json()
  if (result.data && result.data.transactions) {
    const newTransactions = result.data.transactions
      .map(t => ({
        hash: t.transactionHash,
        network: t.chain,
        to: t.recipient,
        from: t.sender,
      }))
      .filter(transaction => transaction.network === network)
      .map(transaction => {
        return web3Service.getTransaction(transaction.hash)
      })
    const updatedTransactions = await Promise.all(newTransactions)
    return updatedTransactions.reduce(
      (collect, transaction) => ({
        ...collect,
        [transaction.hash]: transaction,
      }),
      {}
    )
  }
  return {}
}

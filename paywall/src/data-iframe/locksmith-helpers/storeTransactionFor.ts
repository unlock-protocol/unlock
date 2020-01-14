import { TransactionDefaults } from '../blockchainHandler/blockChainTypes'

declare let __ENVIRONMENT_VARIABLES__: any

export const storeTransactionFor = async (
  accountAddress: string,
  networkId: number,
  transaction: TransactionDefaults
): Promise<void> => {
  const { locksmithUri } = __ENVIRONMENT_VARIABLES__
  const url = `${locksmithUri}/transaction`
  const recipient = transaction.lock || transaction.to

  const payload = {
    transactionHash: transaction.hash,
    sender: accountAddress,
    // when purchasing directly, who we purchase the key "for" is
    // also the "sender" whose wallet the funds came from
    for: accountAddress,
    recipient,
    data: transaction.input,
    chain: networkId,
  }

  try {
    await window.fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  } catch (e) {
    // we don't pass this error along because it is a non-essential feature
    // eslint-disable-next-line no-console
    console.log('unable to save key purchase transaction')
    // eslint-disable-next-line no-console
    console.error(e)
  }
}

export default storeTransactionFor

import WalletService from '../../walletService'

/**
 * Function which sets a new wallet service and connects to it
 * @param {*} unlockAddress
 * @param {*} nock
 */
export const prepWalletService = (
  unlockAddress,
  contract,
  provider,
  nock,
  done
) => {
  nock.cleanAll()
  const walletService = new WalletService({
    unlockAddress,
  })

  const netVersion = 1984
  nock.netVersionAndYield(netVersion)

  contract.networks = {
    [netVersion]: {
      events: {},
      links: {},
      address: unlockAddress,
      transactionHash:
        '0x8545541749873b42c96e1699c2e62f0f4062ca57f3398270423c1089232ef7dd',
    },
  }

  walletService.on('network.changed', () => {
    done(walletService)
  })

  return walletService.connect(provider)
}

export default {
  prepWalletService,
}

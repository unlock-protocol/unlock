import { CheckoutService } from '../checkoutMachine'
import { useSelector } from '@xstate/react'
import { usePrivy } from '@privy-io/react-auth'
import { useEmbeddedWallet } from '~/hooks/useEmbeddedWallet'
import { ConfirmCrypto } from './ConfirmCrypto'
import { PrivyTransactionPromptWrapper } from '../embedded-wallet/PrivyTransactionPromptWrapper'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { Lock } from '~/unlockTypes'
import { useConfig } from '~/utils/withConfig'
import { getReferrer, lockTickerSymbol } from '~/utils/checkoutLockUtils'
import { useQuery } from '@tanstack/react-query'
import { fetchRecipientsData } from '../utils'
import { purchasePriceFor } from '~/hooks/usePricing'
import { ethers } from 'ethers'

interface Props {
  checkoutService: CheckoutService
  onConfirmed: (lock: string, network: number, hash?: string) => void
  onError: (message: string) => void
}

export function ConfirmCryptoWrapper({
  checkoutService,
  onConfirmed,
  onError,
}: Props) {
  const { isEmbeddedWallet } = useEmbeddedWallet()
  const { sendTransaction } = usePrivy()
  const web3Service = useWeb3Service()
  const config = useConfig()

  const { lock, recipients, keyManagers, data, payment, paywallConfig } =
    useSelector(checkoutService, (state) => state.context)

  const { address: lockAddress, network: lockNetwork, keyPrice } = lock!
  const currencyContractAddress = lock?.currencyContractAddress

  const symbol = lockTickerSymbol(
    lock as Lock,
    config.networks[lock!.network].nativeCurrency.symbol
  )

  // Combined query for purchase data and pricing
  const {
    data: pricingData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      'pricingData',
      lockNetwork,
      lockAddress,
      paywallConfig,
      recipients,
      data,
      currencyContractAddress,
      symbol,
    ],
    queryFn: async () => {
      // First, get purchase data
      let purchaseData =
        data || Array.from({ length: recipients.length }).map(() => '0x')

      const dataBuilder =
        paywallConfig.locks[lockAddress].dataBuilder ||
        paywallConfig.dataBuilder

      if (dataBuilder) {
        const delegatedData = await fetchRecipientsData(dataBuilder, {
          recipients,
          lockAddress,
          network: lockNetwork,
        })
        if (delegatedData) {
          purchaseData = delegatedData
        }
      }

      // Then, get pricing data using the confirmed purchase data
      return await purchasePriceFor(web3Service, {
        lockAddress,
        network: lockNetwork,
        recipients,
        data: purchaseData,
        paywallConfig,
        currencyContractAddress,
        symbol,
        payment,
      })
    },
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
  })

  const keyPrices: string[] =
    pricingData?.map((item) => item.amount.toString()) ||
    new Array(recipients!.length).fill(keyPrice)

  const referrers: string[] = recipients.map((recipient) => {
    return getReferrer(recipient, paywallConfig, lockAddress)
  })

  const handleEmbeddedWalletConfirm = async () => {
    try {
      // Get transaction data using web3Service
      const txs = await web3Service.purchaseKeys({
        lockAddress,
        network: lockNetwork,
        params: {
          owners: recipients,
          keyPrices,
          lockAddress,
          keyManagers: keyManagers?.length ? keyManagers : undefined,
          referrers,
          data:
            data || Array.from({ length: recipients.length }).map(() => '0x'), // Use original data
        },
      })

      console.log('txs', txs)

      const [purchaseTx] = txs
      const tx = await sendTransaction({
        to: purchaseTx.to,
        data: purchaseTx.data,
        value: ethers.formatEther(purchaseTx.value?.toString() || '0'),
      })
      onConfirmed(lockAddress, lockNetwork, tx.transactionHash)
    } catch (error: any) {
      console.error(error)
      onError(error.message || 'Transaction failed')
    }
  }

  if (isEmbeddedWallet) {
    return (
      <PrivyTransactionPromptWrapper
        transactionFunction={handleEmbeddedWalletConfirm}
      />
    )
  }

  return (
    <ConfirmCrypto
      checkoutService={checkoutService}
      onConfirmed={onConfirmed}
      onError={onError}
    />
  )
}

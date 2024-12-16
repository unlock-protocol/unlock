import { LoginModal as FundingModal, useFundWallet } from '@privy-io/react-auth'

import { Badge, Button, Modal, Placeholder } from '@unlock-protocol/ui'
import { useState } from 'react'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { useQuery } from '@tanstack/react-query'
import { base } from 'viem/chains'
import { SettingCard } from '../locks/Settings/elements/SettingCard'
import { useEthPrice } from '~/hooks/useEthPrice'

export const Funding = () => {
  const { account } = useAuthenticate()
  const web3Service = useWeb3Service()
  const { fundWallet } = useFundWallet({
    onUserExited: () => {
      ToastHelper.error('Funding operation cancelled')
    },
  })
  const [showFundingModal, setShowFundingModal] = useState(false)

  const { isPending: isLoadingBalance, data: userBalance } = useQuery({
    queryKey: ['getBalance', account, 8453],
    queryFn: async () => {
      return parseFloat(await web3Service.getAddressBalance(account!, 8453))
    },
  })

  const { data: ethPrice } = useEthPrice({
    amount: userBalance?.toFixed(4),
    network: 8453,
  })

  const handleFundWallet = async () => {
    setShowFundingModal(true)
    await fundWallet(account!, {
      chain: base,
    })
  }

  const ethPriceNumber =
    typeof ethPrice === 'string' ? parseFloat(ethPrice) : ethPrice

  return (
    <SettingCard
      label="Fund Wallet"
      description="You can fund your account with ETH. This will enable you to purchase paid memberships or event tickets."
      defaultOpen={true}
    >
      <div className="space-y-5 mt-5">
        {isLoadingBalance ? (
          <Placeholder.Root>
            <Placeholder.Line size="md" />
          </Placeholder.Root>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <div className="text-gray-700">Your current balance</div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={userBalance === 0 ? 'red' : 'default'}
                  className="text-lg font-bold"
                >
                  {userBalance?.toFixed(4)} ETH
                </Badge>
                {userBalance !== 0 && ethPriceNumber && ethPriceNumber > 0 && (
                  <div className="text-gray-600">
                    (≈{' '}
                    <span className="font-semibold">
                      ${new Intl.NumberFormat().format(ethPriceNumber)}
                    </span>
                    )
                  </div>
                )}
              </div>
            </div>

            <Button onClick={handleFundWallet}>Fund Account</Button>

            <Modal
              isOpen={showFundingModal}
              setIsOpen={setShowFundingModal}
              size="small"
            >
              <FundingModal open={showFundingModal} />
            </Modal>
          </>
        )}
      </div>
    </SettingCard>
  )
}

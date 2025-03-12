import { useEffect, Fragment } from 'react'
import {
  LoginModal as FundingContent,
  useFundWallet,
} from '@privy-io/react-auth'
import { base } from 'viem/chains'
import { CheckoutService } from '../checkoutMachine'
import { useSelector } from '@xstate/react'
import { Stepper } from '../../Stepper'
import { Button, Placeholder } from '@unlock-protocol/ui'
import { PoweredByUnlock } from '../../PoweredByUnlock'
import { useBaseRoute } from '~/hooks/useCrosschainBaseRoute'
import { useAuthenticate } from '~/hooks/useAuthenticate'

interface PrivyFundingProps {
  checkoutService: CheckoutService
}

const PrivyFunding = ({ checkoutService }: PrivyFundingProps) => {
  const { account } = useAuthenticate()

  const { recipients, paywallConfig, keyManagers, lock, renew, data } =
    useSelector(checkoutService, (state) => state.context)

  const {
    data: baseRoute,
    isLoading: isBaseRouteLoading,
    fundingAmount,
  } = useBaseRoute({
    lock,
    recipients,
    keyManagers,
    paywallConfig,
    renew,
    data,
  })

  const { fundWallet } = useFundWallet({
    onUserExited: async () => {
      checkoutService.send({
        type: 'SELECT_PAYMENT_METHOD',
        payment: {
          method: 'crosschain_purchase',
          route: baseRoute,
        },
      })
    },
  })

  const handleFundWallet = async () => {
    if (!fundingAmount) {
      throw new Error('Token payment amount is required.')
    }

    await fundWallet(account!, {
      chain: base,
      amount: fundingAmount,
    })
  }

  useEffect(() => {
    if (baseRoute) {
      handleFundWallet()
    }
  }, [baseRoute])

  if (isBaseRouteLoading) {
    return (
      <Fragment>
        <Stepper service={checkoutService} />
        <main className="h-full px-6 py-4 overflow-auto">
          <Placeholder.Root className="mt-2 max-w-sm mx-auto">
            <Placeholder.Line size="sm" />
            <Placeholder.Card />
          </Placeholder.Root>

          <Placeholder.Root className="mt-7 max-w-sm mx-auto">
            <Placeholder.Line size="md" />
            <Placeholder.Line size="md" />
            <Placeholder.Line size="md" />
          </Placeholder.Root>

          <Placeholder.Root className="mt-7 max-w-xs mx-auto">
            <Placeholder.Line size="sm" />
          </Placeholder.Root>
        </main>
        <footer className="grid items-center px-6 pt-6 border-t">
          <Button disabled={true} className="w-full">
            Next
          </Button>

          <PoweredByUnlock />
        </footer>
      </Fragment>
    )
  }

  return (
    <Fragment>
      <Stepper service={checkoutService} />
      <main className="h-full pb-4 overflow-auto">
        <FundingContent open={true} />
      </main>
    </Fragment>
  )
}

export default PrivyFunding

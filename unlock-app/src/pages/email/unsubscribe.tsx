import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { AppLayout } from '~/components/interface/layouts/AppLayout'
import {
  useEmailListReSubscribe,
  useEmailListUnSubscribe,
} from '~/hooks/useEmailSubscription'
import { Button } from '@unlock-protocol/ui'

export const InvalidSubscribeLink = () => {
  return (
    <AppLayout>
      <div>
        <h1 className="text-4xl font-bold text-center">
          Invalid Subscribe Link
        </h1>
      </div>
    </AppLayout>
  )
}

interface SubscriptionProps {
  lockAddress: string
  network: number
}
export const Subscription = ({ lockAddress, network }: SubscriptionProps) => {
  const { mutateAsync: resubscribe, isLoading: isResubscribing } =
    useEmailListReSubscribe({
      lockAddress,
      network,
    })
  const {
    mutateAsync: unsubscribe,
    isLoading: isUnsubscribing,
    status,
  } = useEmailListUnSubscribe({
    lockAddress,
    network,
  })

  const isUnSubscribed = status === 'success'

  return (
    <AppLayout authRequired>
      <div className="max-w-3xl mx-auto">
        <div className="grid gap-4">
          <header className="leading-relaxed">
            <h1 className="text-3xl font-bold"> Email Subscription </h1>
            <p className="text-gray-600 ">
              {isUnSubscribed
                ? "You have been unsubscribed from this event's emails. You can resubscribe at any time."
                : 'Unsubscribe from receiving emails from the lock'}
            </p>
          </header>
          <div className="flex gap-6">
            {isUnSubscribed ? (
              <Button loading={isResubscribing} onClick={() => resubscribe()}>
                Subscribe Back
              </Button>
            ) : (
              <Button loading={isUnsubscribing} onClick={() => unsubscribe()}>
                Unsubscribe
              </Button>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

const UnsubscribePage: NextPage = () => {
  const router = useRouter()
  const lockAddress = router.query?.lockAddress?.toString()
  const network = Number(router.query?.network)
  const validParams = lockAddress && network
  return validParams ? (
    <Subscription lockAddress={lockAddress} network={network} />
  ) : (
    <InvalidSubscribeLink />
  )
}

export default UnsubscribePage

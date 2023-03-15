import { Button } from '@unlock-protocol/ui'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { PaywallConfigType as PaywallConfig } from '@unlock-protocol/core'
import { CheckoutForm } from './elements/CheckoutForm'
import { CheckoutPreview } from './elements/CheckoutPreview'
import { BsArrowLeft as ArrowBackIcon } from 'react-icons/bs'
import { useLockSettings } from '~/hooks/useLockSettings'

const Header = () => {
  return (
    <header className="flex flex-col gap-4">
      <h1 className="text-4xl font-bold">Checkout Builder</h1>
      <span className="text-base text-gray-700">
        Customize your membership checkout experience. The preview on the left
        is updated in realtime.
      </span>
    </header>
  )
}

export const CheckoutUrlPage = () => {
  const router = useRouter()
  const query = router.query

  const { lock: lockAddress, network } = query ?? {}
  const { getIsRecurringPossible } = useLockSettings()

  // TODO @kalidou : let's use the default values from zod?
  const [paywallConfig, setPaywallConfig] = useState<PaywallConfig>({
    locks: {},
    pessimistic: true,
    skipRecipient: true,
  })

  const handleRecurring = (locks: Record<string, any>) => {
    let newLocksMapping: Record<string, any> = {
      ...locks,
    }
    Object.entries(locks).map(async ([lockAddress, values]) => {
      const { isRecurringPossible = false } = await getIsRecurringPossible({
        lockAddress,
        network: values!.network!,
      })

      // checkout config URL default to 1 year of recurring payments if recurring is set
      if (isRecurringPossible) {
        const recurringPayments =
          values?.recurringPayments || (isRecurringPossible ? 12 : undefined)

        newLocksMapping = {
          ...locks,
          ...newLocksMapping,
          [lockAddress]: {
            ...values,
            recurringPayments,
          },
        }

        setPaywallConfig({
          ...paywallConfig,
          locks: {
            ...newLocksMapping,
          },
        })
      }
    })
  }

  const onAddLocks = async (locks: any) => {
    setPaywallConfig({
      ...paywallConfig,
      locks,
    })
    handleRecurring(locks)
  }

  const onBasicConfigChange = (fields: Partial<PaywallConfig>) => {
    const hasDefaultLock =
      Object.keys(fields?.locks ?? {}).length === 0 && lockAddress && network

    if (hasDefaultLock) {
      fields = {
        ...fields,
        locks: {
          [lockAddress as string]: {
            network: parseInt(`${network!}`),
          },
        },
      }
    }

    setPaywallConfig({
      ...paywallConfig,
      ...fields,
    })
  }

  const addDefaultLockFromQuery = () => {
    if (!lockAddress && !network) return null
    onAddLocks({
      [lockAddress as string]: {
        network: parseInt(`${network!}`),
        skipRecipient: true,
      },
    })
  }

  useEffect(() => {
    addDefaultLockFromQuery()
  }, [])

  const TopBar = () => {
    return (
      <Button variant="borderless" aria-label="arrow back">
        <ArrowBackIcon
          size={20}
          className="cursor-pointer"
          onClick={() => router.back()}
        />
      </Button>
    )
  }

  return (
    <>
      <TopBar />
      <div className="flex flex-col w-full min-h-screen gap-8 pt-10 pb-20 md:flex-row">
        <div className="md:w-1/2">
          <CheckoutPreview paywallConfig={paywallConfig} />
        </div>
        <div className="flex flex-col gap-4 md:w-1/2">
          <Header />
          <CheckoutForm
            onAddLocks={onAddLocks}
            onBasicConfigChange={onBasicConfigChange}
            paywallConfig={paywallConfig}
          />
        </div>
      </div>
    </>
  )
}

import { CheckoutService, LockState } from './checkoutMachine'
import { useConfig } from '~/utils/withConfig'
import { Connected } from '../Connected'
import { LockOptionPlaceholder, Pricing } from '../Lock'
import { useActor } from '@xstate/react'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { Stepper } from '../Stepper'
import { useQuery } from 'react-query'
import { Fragment, useState, useMemo, useEffect } from 'react'
import { RadioGroup } from '@headlessui/react'
import { getLockProps } from '~/utils/lock'
import { getFiatPricing } from '~/hooks/useCards'
import {
  RiCheckboxBlankCircleLine as CheckBlankIcon,
  RiCheckboxCircleFill as CheckIcon,
  RiTimer2Line as DurationIcon,
  RiCoupon2Line as QuantityIcon,
} from 'react-icons/ri'
import { Button, Icon } from '@unlock-protocol/ui'
import { LabeledItem } from '../LabeledItem'
import * as Avatar from '@radix-ui/react-avatar'
import { numberOfAvailableKeys } from '~/utils/checkoutLockUtils'
import { useCheckoutSteps } from './useCheckoutItems'

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
}

export function Select({ checkoutService, injectedProvider }: Props) {
  const [state, send] = useActor(checkoutService)
  const { paywallConfig, lock: selectedLock } = state.context
  const { isLoading: isLocksLoading, data: locks } = useQuery(
    ['locks', JSON.stringify(paywallConfig)],
    async () => {
      const items = await Promise.all(
        Object.entries(paywallConfig.locks).map(async ([lock, props]) => {
          const networkId: number = props.network || paywallConfig.network || 1
          const [lockData, fiatPricing] = await Promise.all([
            web3Service.getLock(lock, networkId),
            getFiatPricing(config, lock, networkId),
          ])
          return {
            ...props,
            ...lockData,
            name: props.name || lockData.name,
            network: networkId,
            address: lock,
            fiatPricing,
            isSoldOut: numberOfAvailableKeys(lockData) <= 0,
          } as LockState
        })
      )

      const locks = items?.filter(
        (item) => !(item.isSoldOut && paywallConfig.hideSoldOut)
      )

      return locks
    }
  )

  const locksGroupedByNetwork = useMemo(
    () =>
      locks?.reduce<{
        [key: number]: LockState[]
      }>((acc, item) => {
        const current = acc[item.network]
        if (current) {
          acc[item.network] = [...current, item]
        } else {
          acc[item.network] = [item]
        }
        return acc
      }, {}),
    [locks]
  )

  const lockOptions = useMemo(() => {
    return Object.entries(paywallConfig.locks).map(([lock, props]) => ({
      ...props,
      address: lock,
      network: props.network || paywallConfig.network || 1,
    }))
  }, [paywallConfig.locks, paywallConfig.network])

  const [lock, setLock] = useState<LockState | undefined>(selectedLock)

  const skipQuantity = useMemo(() => {
    const maxRecipients = lock?.maxRecipients || paywallConfig.maxRecipients
    const minRecipients = lock?.minRecipients || paywallConfig.minRecipients
    const hasMaxRecipients = maxRecipients && maxRecipients > 1
    const hasMinRecipients = minRecipients && minRecipients > 1
    return !(hasMaxRecipients || hasMinRecipients)
  }, [lock, paywallConfig])

  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false)
  const config = useConfig()
  const { account, network, changeNetwork, isUnlockAccount } = useAuth()
  const web3Service = useWeb3Service()

  const { isLoading: isMembershipsLoading, data: memberships } = useQuery(
    ['memberships', account, JSON.stringify(paywallConfig)],
    async () => {
      const memberships = await Promise.all(
        Object.entries(paywallConfig.locks).map(
          async ([lockAddress, props]) => {
            const lockNetwork = props.network || paywallConfig.network || 1
            const [balance, total] = await Promise.all([
              web3Service.balanceOf(lockAddress, account!, lockNetwork),
              web3Service.totalKeys(lockAddress, account!, lockNetwork),
            ])
            return {
              lock: lockAddress,
              balance,
              total,
              network: lockNetwork,
            }
          }
        )
      )
      return memberships
    },
    {
      enabled: !!account,
    }
  )

  const lockNetwork = lock?.network ? config?.networks?.[lock.network] : null
  const isNetworkSwitchRequired =
    lockNetwork && lock?.network !== network && !isUnlockAccount

  const existingMember = !!memberships?.find(
    (item) => item.balance > 0 && item.lock === lock?.address
  )

  const expiredMember = !!memberships?.find(
    (item) => item.total > 0 && item.lock === lock?.address && item.balance <= 0
  )

  const isDisabled =
    isLocksLoading ||
    isMembershipsLoading ||
    // if locks are sold out and the user is not an existing member of the lock
    (lock?.isSoldOut && !existingMember)

  const stepItems = useCheckoutSteps(checkoutService)

  useEffect(() => {
    if (locks?.length) {
      const item = locks.find((lock) => !lock.isSoldOut)
      setLock(item)
    }
  }, [locks])

  return (
    <Fragment>
      <Stepper position={1} service={checkoutService} items={stepItems} />
      <main className="h-full px-6 py-2 overflow-auto">
        {isLocksLoading ? (
          <div className="mt-6 space-y-4">
            {Array.from({ length: lockOptions.length }).map((_, index) => (
              <LockOptionPlaceholder key={index} />
            ))}
          </div>
        ) : (
          <RadioGroup
            key="select"
            className="box-content space-y-6"
            value={lock}
            onChange={setLock}
          >
            {locksGroupedByNetwork &&
              Object.entries(locksGroupedByNetwork).map(([network, items]) => (
                <section key={network} className="space-y-4">
                  <header>
                    <p className="text-lg font-bold text-brand-ui-primary">
                      {config?.networks[network]?.name}
                    </p>
                  </header>
                  {items.map((item) => {
                    const disabled = item.isSoldOut && !item.isMember
                    return (
                      <RadioGroup.Option
                        disabled={disabled}
                        key={item.address}
                        value={item}
                        className={({ checked, disabled }) =>
                          `flex flex-col p-2 w-full gap-4 items-center border border-gray-200 rounded-xl cursor-pointer relative ${
                            checked && 'border-ui-main-200 bg-ui-main-50'
                          } ${
                            disabled &&
                            `opacity-80 bg-gray-50  ${
                              isMembershipsLoading
                                ? 'cursor-wait'
                                : 'cursor-not-allowed'
                            }`
                          }`
                        }
                      >
                        {({ checked }) => {
                          const formattedData = getLockProps(
                            item,
                            item.network,
                            config.networks[item.network].baseCurrencySymbol,
                            item.name
                          )
                          const lockImageURL = `${config.services.storage.host}/lock/${item?.address}/icon`

                          return (
                            <Fragment>
                              <div className="flex w-full gap-x-2">
                                <div>
                                  <Avatar.Root className="inline-flex items-center justify-center w-14 h-14 rounded-xl">
                                    <Avatar.Image
                                      src={lockImageURL}
                                      alt={item.name}
                                    />
                                    <Avatar.Fallback className="bg-gray-50">
                                      {item.name.slice(0, 2).toUpperCase()}
                                    </Avatar.Fallback>
                                  </Avatar.Root>
                                </div>
                                <div className="flex items-start justify-between w-full">
                                  <RadioGroup.Label
                                    className="text-lg font-bold"
                                    as="p"
                                  >
                                    {item.name}
                                  </RadioGroup.Label>
                                  <Pricing
                                    keyPrice={formattedData.formattedKeyPrice}
                                    usdPrice={formattedData.convertedKeyPrice}
                                    isCardEnabled={formattedData.cardEnabled}
                                  />
                                </div>
                              </div>
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                  <LabeledItem
                                    label="Duration"
                                    icon={DurationIcon}
                                    value={formattedData.formattedDuration}
                                  />
                                  <LabeledItem
                                    label="Quantity"
                                    icon={QuantityIcon}
                                    value={
                                      formattedData.isSoldOut
                                        ? 'Sold out'
                                        : formattedData.formattedKeysAvailable
                                    }
                                  />
                                </div>
                                <div>
                                  {checked ? (
                                    <Icon
                                      size="large"
                                      className="fill-brand-ui-primary"
                                      icon={CheckIcon}
                                    />
                                  ) : (
                                    <Icon
                                      size="large"
                                      className="fill-brand-ui-primary"
                                      icon={CheckBlankIcon}
                                    />
                                  )}
                                </div>
                              </div>
                            </Fragment>
                          )
                        }}
                      </RadioGroup.Option>
                    )
                  })}
                </section>
              ))}
          </RadioGroup>
        )}
      </main>
      <footer className="grid items-center px-6 pt-6 border-t">
        <Connected
          service={checkoutService}
          injectedProvider={injectedProvider}
        >
          <div className="grid">
            {isNetworkSwitchRequired && (
              <Button
                disabled={isDisabled || isSwitchingNetwork}
                loading={isSwitchingNetwork}
                onClick={async (event) => {
                  setIsSwitchingNetwork(true)
                  event.preventDefault()
                  await changeNetwork(lockNetwork)
                  setIsSwitchingNetwork(false)
                }}
              >
                Switch to {lockNetwork?.name}
              </Button>
            )}
            {!isNetworkSwitchRequired && (
              <Button
                disabled={isDisabled}
                onClick={async (event) => {
                  event.preventDefault()
                  // Silently change network to the correct one in the background
                  if (isUnlockAccount) {
                    await changeNetwork(lockNetwork)
                  }

                  if (!lock) {
                    return
                  }

                  send({
                    type: 'SELECT_LOCK',
                    lock,
                    existingMember,
                    skipQuantity,
                    expiredMember,
                  })
                }}
              >
                Next
              </Button>
            )}
          </div>
        </Connected>
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}

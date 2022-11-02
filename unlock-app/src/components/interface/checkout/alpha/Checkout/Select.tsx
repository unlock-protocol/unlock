import { CheckoutService, LockState } from './checkoutMachine'
import { useConfig } from '~/utils/withConfig'
import { Connected } from '../Connected'
import { LockOptionPlaceholder, Pricing } from '../Lock'
import { useActor } from '@xstate/react'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { Stepper } from '../Stepper'
import { useQuery } from '@tanstack/react-query'
import { Fragment, useState, useMemo, useEffect } from 'react'
import { RadioGroup } from '@headlessui/react'
import { getLockProps } from '~/utils/lock'
import { getFiatPricing } from '~/hooks/useCards'
import {
  RiCheckboxBlankCircleLine as CheckBlankIcon,
  RiCheckboxCircleFill as CheckIcon,
  RiTimer2Line as DurationIcon,
  RiCoupon2Line as QuantityIcon,
  RiExternalLinkLine as ExternalLinkIcon,
  RiRepeatFill as RecurringIcon,
  RiCheckboxCircleFill as CheckMarkIcon,
} from 'react-icons/ri'
import { Badge, Button, Icon } from '@unlock-protocol/ui'
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
  const [lock, setLock] = useState<LockState | undefined>(selectedLock)
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

  const { isInitialLoading: isMembershipsLoading, data: memberships } =
    useQuery(
      ['memberships', account, JSON.stringify(paywallConfig)],
      async () => {
        const memberships = await Promise.all(
          Object.entries(paywallConfig.locks).map(
            async ([lockAddress, props]) => {
              const lockNetwork = props.network || paywallConfig.network || 1
              const [member, total] = await Promise.all([
                web3Service.getHasValidKey(lockAddress, account!, lockNetwork),
                web3Service.totalKeys(lockAddress, account!, lockNetwork),
              ])
              // if not member but total is above 0
              const expired = !member && total > 0
              return {
                lock: lockAddress,
                expired,
                member,
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

  const membership = memberships?.find((item) => item.lock === lock?.address)

  const isDisabled =
    isLocksLoading ||
    isMembershipsLoading ||
    !lock ||
    // if locks are sold out and the user is not an existing member of the lock
    (lock?.isSoldOut && !(membership?.member || membership?.expired))

  const stepItems = useCheckoutSteps(checkoutService)

  useEffect(() => {
    if (locks?.length) {
      const filtered = locks.filter((lock) => !lock.isSoldOut)
      const item = filtered.find((lock) => lock.default)
      setLock(item || filtered[0])
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
                            checked && 'border-ui-main-100 bg-gray-100'
                          } ${
                            disabled &&
                            `opacity-80 bg-gray-100  ${
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
                          const isMember = memberships?.find(
                            (m) => m.lock === item.address
                          )?.member
                          return (
                            <Fragment>
                              <div className="flex w-full gap-x-4">
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
                                  <div className="flex flex-col gap-1">
                                    <RadioGroup.Label
                                      className="text-lg font-bold line-clamp-1"
                                      as="p"
                                    >
                                      {item.name}
                                    </RadioGroup.Label>
                                    <a
                                      href={config.networks[
                                        item.network
                                      ].explorer.urls.address(item.address)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-2 text-sm cursor-pointer text-brand-ui-primary hover:opacity-75"
                                    >
                                      View Contract
                                      <Icon
                                        icon={ExternalLinkIcon}
                                        size="small"
                                      />
                                    </a>
                                  </div>

                                  <Pricing
                                    keyPrice={formattedData.formattedKeyPrice}
                                    usdPrice={formattedData.convertedKeyPrice}
                                    isCardEnabled={formattedData.cardEnabled}
                                  />
                                </div>
                              </div>

                              <div className="w-full space-y-2">
                                <div className="flex justify-between w-full place-items-center">
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
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
                                    {item.recurringPayments && (
                                      <LabeledItem
                                        label="Renew"
                                        icon={RecurringIcon}
                                        value={
                                          typeof item.recurringPayments ===
                                          'number'
                                            ? `${item.recurringPayments} times`
                                            : item.recurringPayments
                                        }
                                      />
                                    )}
                                  </div>
                                  <div>
                                    {checked ? (
                                      <Icon
                                        size={25}
                                        className="fill-brand-ui-primary"
                                        icon={CheckIcon}
                                      />
                                    ) : (
                                      <Icon
                                        size={25}
                                        className="fill-brand-ui-primary"
                                        icon={CheckBlankIcon}
                                      />
                                    )}
                                  </div>
                                </div>
                                {isMember && (
                                  <div className="flex items-center justify-between w-full px-2 py-1 text-sm text-gray-500 border border-gray-300 rounded">
                                    You already have this membership{' '}
                                    <Badge
                                      size="tiny"
                                      iconRight={<CheckMarkIcon />}
                                      variant="green"
                                    >
                                      {' '}
                                      Valid{' '}
                                    </Badge>
                                  </div>
                                )}
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
                    existingMember: !!membership?.member,
                    skipQuantity,
                    // unlock account are unable to renew
                    expiredMember: isUnlockAccount
                      ? false
                      : !!membership?.expired,
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

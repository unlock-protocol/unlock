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
  RiRepeatFill as RecurringIcon,
  RiCheckboxCircleFill as CheckMarkIcon,
} from 'react-icons/ri'
import { Badge, Button, Icon } from '@unlock-protocol/ui'
import { LabeledItem } from '../LabeledItem'
import * as Avatar from '@radix-ui/react-avatar'
import { numberOfAvailableKeys } from '~/utils/checkoutLockUtils'
import { minifyAddress } from '@unlock-protocol/ui'
import { ViewContract } from '../ViewContract'
import { useCheckoutHook } from './useCheckoutHook'
interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
}

interface LockOptionProps {
  lock: LockState
  disabled: boolean
}

const LockOption = ({ disabled, lock }: LockOptionProps) => {
  const config = useConfig()
  return (
    <RadioGroup.Option
      disabled={disabled}
      key={lock.address}
      value={lock}
      className={({ checked, disabled }) =>
        `flex flex-col p-2 w-full gap-2 items-center border border-gray-200 rounded-xl cursor-pointer relative ${
          checked && 'border-ui-main-100 bg-gray-100'
        } ${disabled && `opacity-80 bg-gray-100 cursor-not-allowed`}`
      }
    >
      {({ checked }) => {
        const formattedData = getLockProps(
          lock,
          lock.network,
          config.networks[lock.network].nativeCurrency.symbol,
          lock.name
        )
        const lockImageURL = `${config.services.storage.host}/lock/${lock?.address}/icon`

        return (
          <Fragment>
            <div className="flex w-full gap-x-4">
              <div>
                <Avatar.Root className="inline-flex items-center justify-center w-14 h-14 rounded-xl">
                  <Avatar.Image src={lockImageURL} alt={lock.name} />
                  <Avatar.Fallback className="bg-gray-50">
                    {lock.name.slice(0, 2).toUpperCase()}
                  </Avatar.Fallback>
                </Avatar.Root>
              </div>
              <div className="flex items-start justify-between w-full">
                <div className="flex flex-col gap-1">
                  <RadioGroup.Label
                    className="text-lg font-bold line-clamp-1"
                    as="p"
                  >
                    {lock.name}
                  </RadioGroup.Label>
                  <ViewContract
                    network={lock.network}
                    lockAddress={lock.address}
                  />
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
                  {!!lock.recurringPayments &&
                    parseInt(lock.recurringPayments.toString()) > 1 && (
                      <LabeledItem
                        label="Renew"
                        icon={RecurringIcon}
                        value={
                          typeof lock.recurringPayments === 'number'
                            ? `${lock.recurringPayments} times`
                            : lock.recurringPayments
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
              {lock.isMember && (
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
}

export function Select({ checkoutService, injectedProvider }: Props) {
  const [state, send] = useActor(checkoutService)
  const { paywallConfig, lock: selectedLock } = state.context
  const [lock, setLock] = useState<LockState | undefined>(selectedLock)
  const { isLoading: isLocksLoading, data: locks } = useQuery(
    ['locks', JSON.stringify(paywallConfig)],
    async () => {
      const items = await Promise.all(
        Object.entries(paywallConfig.locks).map(
          async ([lockAddress, props]) => {
            const networkId: number =
              props.network || paywallConfig.network || 1
            const [lockData, fiatPricing] = await Promise.all([
              web3Service.getLock(lockAddress, networkId),
              getFiatPricing({
                config,
                lockAddress,
                network: networkId,
              }),
            ])
            return {
              ...props,
              ...lockData,
              name: props.name || lockData.name,
              network: networkId,
              address: lockAddress,
              fiatPricing,
              isSoldOut: numberOfAvailableKeys(lockData) <= 0,
            } as LockState
          }
        )
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

  const skipRecipient = useMemo(() => {
    const skip = lock?.skipRecipient || paywallConfig.skipRecipient
    const collectsMetadadata =
      lock?.metadataInputs ||
      paywallConfig.metadataInputs ||
      paywallConfig.emailRequired ||
      lock?.emailRequired
    return skip && !collectsMetadadata
  }, [lock, paywallConfig])

  const config = useConfig()
  const { account, isUnlockAccount } = useAuth()
  const web3Service = useWeb3Service()
  const expectedAddress = paywallConfig.expectedAddress

  const isNotExpectedAddress = !!(
    account &&
    expectedAddress &&
    expectedAddress.toLowerCase() !== account.toLowerCase()
  )

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

  const membership = memberships?.find((item) => item.lock === lock?.address)
  const { isLoading: isLoadingHook, lockHookMapping } =
    useCheckoutHook(checkoutService)

  const hookType = useMemo(() => {
    if (!lock) return undefined

    const hook =
      lockHookMapping?.[lock?.address?.trim()?.toLowerCase()] ?? undefined
    return hook
  }, [lockHookMapping, lock])

  const isDisabled =
    isLocksLoading ||
    isMembershipsLoading ||
    !lock ||
    // if locks are sold out and the user is not an existing member of the lock
    (lock?.isSoldOut && !(membership?.member || membership?.expired)) ||
    isNotExpectedAddress ||
    isLoadingHook

  useEffect(() => {
    if (locks?.length) {
      const filtered = locks.filter((lock) => !lock.isSoldOut)
      const item = filtered.find((lock) => lock.default)
      setLock(item || filtered[0])
    }
  }, [locks])

  const isLoading = isLocksLoading || isLoadingHook

  return (
    <Fragment>
      <Stepper service={checkoutService} />
      <main className="h-full px-6 py-2 overflow-auto">
        {isLoading ? (
          <div className="mt-6 space-y-4">
            {Array.from({ length: lockOptions.length }).map((_, index) => (
              <LockOptionPlaceholder key={index} />
            ))}
          </div>
        ) : (
          <RadioGroup
            key="select"
            className="box-content space-y-6"
            value={lock || {}}
            onChange={setLock}
          >
            {locksGroupedByNetwork &&
              Object.entries(locksGroupedByNetwork).map(([network, locks]) => {
                const showNetworkSection =
                  Object.keys(locksGroupedByNetwork).length > 1

                return (
                  <section
                    key={network}
                    className={
                      showNetworkSection ? 'grid gap-4' : 'grid gap-4 pt-2'
                    }
                  >
                    {showNetworkSection && (
                      <p className="text-lg font-bold text-brand-ui-primary">
                        {config?.networks[network]?.name}
                      </p>
                    )}
                    {locks.map((lock) => {
                      const disabled = lock.isSoldOut && !lock.isMember
                      const isMember = memberships?.find(
                        (m) => m.lock === lock.address
                      )?.member
                      lock.isMember = lock.isMember ?? isMember
                      return (
                        <LockOption
                          key={lock.address}
                          lock={lock}
                          disabled={disabled}
                        />
                      )
                    })}
                  </section>
                )
              })}
          </RadioGroup>
        )}
      </main>
      <footer className="grid items-center px-6 pt-6 border-t">
        <Connected
          service={checkoutService}
          injectedProvider={injectedProvider}
        >
          <div className="grid">
            {isNotExpectedAddress && (
              <p className="mb-2 text-sm text-center">
                Switch to wallet address {minifyAddress(expectedAddress)} to
                continue.
              </p>
            )}
            <Button
              disabled={isDisabled}
              onClick={async (event) => {
                event.preventDefault()

                if (!lock) {
                  return
                }

                send({
                  type: 'SELECT_LOCK',
                  lock,
                  existingMember: !!membership?.member,
                  skipQuantity,
                  skipRecipient,
                  // unlock account are unable to renew : wut?
                  expiredMember: isUnlockAccount
                    ? false
                    : !!membership?.expired,
                  recipients: account ? [account] : [],
                  hook: hookType,
                })
              }}
            >
              Next
            </Button>
          </div>
        </Connected>
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}

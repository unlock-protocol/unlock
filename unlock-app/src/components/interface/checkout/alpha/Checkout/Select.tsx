import { CheckoutService, LockState } from './checkoutMachine'
import { useConfig } from '~/utils/withConfig'
import { Connected } from '../Connected'
import { LockOptionPlaceholder, Pricing } from '../Lock'
import { useActor } from '@xstate/react'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { Step, StepFinish, StepFinished, Stepper, StepTitle } from '../Progress'
import { useQuery } from 'react-query'
import { Fragment, useState, useMemo } from 'react'
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

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
}

export function Select({ checkoutService, injectedProvider }: Props) {
  const [state, send] = useActor(checkoutService)
  const { paywallConfig, lock: selectedLock } = state.context
  const lockOptions = useMemo(() => {
    return Object.entries(paywallConfig.locks).map(([lock, props]) => ({
      ...props,
      address: lock,
      network: props.network || paywallConfig.network || 1,
    }))
  }, [paywallConfig.locks, paywallConfig.network])
  const [lockOption, setLockOption] = useState(
    lockOptions.find((item) => {
      if (selectedLock) {
        return item.address === selectedLock.address
      } else {
        return item.default
      }
    }) || lockOptions[0]
  )

  const skipQuantity = useMemo(() => {
    const maxRecipients =
      lockOption.maxRecipients || paywallConfig.maxRecipients
    const minRecipients =
      lockOption.minRecipients || paywallConfig.minRecipients
    const hasMaxRecipients = maxRecipients && maxRecipients > 1
    const hasMinRecipients = minRecipients && minRecipients > 1
    return !(hasMaxRecipients || hasMinRecipients)
  }, [lockOption, paywallConfig])

  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false)
  const config = useConfig()
  const { account, network, changeNetwork, isUnlockAccount } = useAuth()
  const web3Service = useWeb3Service()

  const { isLoading: isLocksLoading, data: locks } = useQuery(
    ['locks', JSON.stringify(paywallConfig)],
    async () => {
      const items = await Promise.all(
        Object.entries(paywallConfig.locks).map(async ([lock, props]) => {
          const lockNetwork = props.network || paywallConfig.network || 1
          const [lockData, fiatPricing] = await Promise.all([
            web3Service.getLock(lock, lockNetwork),
            getFiatPricing(config, lock, lockNetwork),
          ])
          return {
            ...props,
            ...lockData,
            name: props.name || lockData.name,
            network: lockNetwork,
            address: lock,
            fiatPricing,
          } as LockState
        })
      )
      const locksByNetwork = items?.reduce<{ [key: number]: LockState[] }>(
        (acc, item) => {
          const current = acc[item.network]
          if (current) {
            acc[item.network] = [...current, item]
          } else {
            acc[item.network] = [item]
          }
          return acc
        },
        {}
      )
      return locksByNetwork
    }
  )

  const { isLoading: isMembershipsLoading, data: memberships } = useQuery(
    ['memberships', account, JSON.stringify(paywallConfig)],
    async () => {
      const memberships = await Promise.all(
        Object.entries(paywallConfig.locks).map(async ([lock, props]) => {
          const lockNetwork = props.network || paywallConfig.network || 1
          const valid = await web3Service.getHasValidKey(
            lock,
            account!,
            lockNetwork
          )
          if (valid) {
            return lock
          }
        })
      )
      return memberships.filter((item) => item)
    },
    {
      enabled: !!account,
    }
  )
  const isDisabled = isLocksLoading || isMembershipsLoading || !lockOption
  const lockNetwork = config?.networks?.[lockOption.network]
  const isNetworkSwitchRequired =
    lockOption.network !== network && !isUnlockAccount

  return (
    <Fragment>
      <Stepper
        position={1}
        service={checkoutService}
        items={[
          {
            id: 1,
            name: 'Select lock',
            to: 'SELECT',
          },
          {
            id: 2,
            name: 'Choose quantity',
            skip: skipQuantity,
            to: 'QUANTITY',
          },
          {
            id: 3,
            name: 'Add recipients',
            to: 'METADATA',
          },
          {
            id: 4,
            name: 'Choose payment',
            to: 'PAYMENT',
          },
          {
            id: 5,
            name: 'Sign message',
            skip: !paywallConfig.messageToSign,
            to: 'MESSAGE_TO_SIGN',
          },
          {
            id: 6,
            name: 'Solve captcha',
            to: 'CAPTCHA',
            skip: !paywallConfig.captcha,
          },
          {
            id: 7,
            name: 'Confirm',
            to: 'CONFIRM',
          },
          {
            id: 8,
            name: 'Minting NFT',
          },
        ]}
      />
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
            value={lockOption}
            onChange={setLockOption}
          >
            {locks &&
              Object.entries(locks).map(([network, items]) => (
                <section key={network} className="space-y-4">
                  <header>
                    <p className="text-lg font-bold text-brand-ui-primary">
                      {config.networks[network].name}
                    </p>
                  </header>
                  {items.map((item) => {
                    const value = lockOptions.find(
                      (option) => item.address === option.address
                    )
                    return (
                      <RadioGroup.Option
                        disabled={isMembershipsLoading}
                        key={item.address}
                        value={value}
                        className={({ checked, disabled }) =>
                          `flex flex-col p-2 w-full gap-4 items-center ring-1 ring-gray-200 rounded-xl cursor-pointer relative ${
                            checked && 'ring-ui-main-200 bg-ui-main-50'
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
                Switch to {lockNetwork.name}
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
                  if (lockOption && locks) {
                    const existingMember = !!memberships?.includes(
                      lockOption.address
                    )
                    const lock = locks[lockOption.network].find(
                      (lock) => lock.address === lockOption.address
                    )!
                    send({
                      type: 'SELECT_LOCK',
                      lock,
                      existingMember,
                      skipQuantity,
                    })
                  }
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

import { PaywallConfigType } from '@unlock-protocol/core'

export const defaultEventCheckoutConfigForLockOnNetwork = (
  lockAddress: string,
  network: number
) => {
  return {
    title: 'Registration',
    locks: {
      [lockAddress]: {
        network,
        metadataInputs: [
          {
            name: 'email',
            type: 'email',
            label: 'Email address (will receive the ticket)',
            required: true,
            placeholder: 'your@email.com',
            defaultValue: '',
          },
          {
            name: 'fullname',
            type: 'text',
            label: 'Full name',
            required: true,
            placeholder: 'Satoshi Nakamoto',
            defaultValue: '',
          },
          {
            name: 'newsletter-optin',
            type: 'checkbox',
            label: 'I agree to receive emails from partners',
            public: false,
            required: false,
            placeholder: '',
          },
        ],
      },
    },
  } as PaywallConfigType
}

export const cloneEventCheckoutConfigForLockOnNetwork = (
  checkoutConfig: PaywallConfigType,
  sourceLockAddress: string,
  lockAddress: string,
  network: number
) => {
  const sourceLockConfig = checkoutConfig.locks?.[sourceLockAddress]

  if (!sourceLockConfig) {
    return defaultEventCheckoutConfigForLockOnNetwork(lockAddress, network)
  }

  return {
    ...checkoutConfig,
    network,
    locks: {
      [lockAddress]: {
        ...sourceLockConfig,
        network,
      },
    },
  } as PaywallConfigType
}

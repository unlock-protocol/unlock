import { z } from 'zod'

export const MetadataInput = z.object({
  type: z.enum(['text', 'date', 'color', 'email', 'url', 'hidden'], {
    description:
      'The type field maps to a certain subset of HTML <input> types, which influences how the form renders. ',
  }),
  name: z
    .string({
      description: 'Name of the attribute to collect.',
    })
    .regex(
      /^[A-Za-z-]+$/,
      'Only letters and dashes are allowed in the name. No spaces, special characters, or separators.'
    ),
  label: z
    .string({
      description: 'Label displayed to users. Defaults to the name field.',
    })
    .optional(),
  required: z
    .boolean({
      description:
        'Check if you require users to enter this before they complete the purchase.',
    })
    .optional()
    .default(false),
  placeholder: z
    .string({
      description: 'Placeholder displayed to users.',
    })
    .optional(),
  value: z
    .string({
      description: 'Value to use for hidden metadata inputs.',
    })
    .optional(),
  defaultValue: z
    .string({
      description: 'Default value for the attribute.',
    })
    .optional(),
  public: z
    .boolean({
      description:
        'If you check this, the attribute will be visible to everyone. Recommended: leave unchecked.',
    })
    .optional(),
})

export type MetadataInputType = z.infer<typeof MetadataInput>

export const PaywallLockConfig = z.object({
  name: z
    .string({
      description: 'Name of the lock to display.',
    })
    .optional(),
  network: z.number().int().positive().optional(),
  metadataInputs: z.array(MetadataInput).optional(),
  referrer: z
    .string({
      description:
        '(Recommended) The address of the purchase referrer. This address may receive a referrer fee if the lock was configured for this, and will receive Unlock Governance tokens if applicable. Put your address if unsure.',
    })
    .optional(),
  recurringPayments: z
    .union([z.string(), z.number()], {
      description:
        'The number of time a membership should be renewed automatically. This only applies to ERC20 locks.',
    })
    .optional(),
  captcha: z
    .boolean({
      description:
        'If enabled, the users will be prompted to go through a captcha during the checkout process. Warning: This only works if the lock is configured with a purchase hook that verifies that captcha is valid.',
    })
    .optional(),
  password: z
    .boolean({
      description:
        'If enabled, the user will be prompted to enter a password in order to complete their purchases. Warning: This only works if the lock is connected to a hook that will handle the password verification.',
    })
    .optional(),
  promo: z
    .boolean({
      description:
        'If enabled, the user will be prompted to enter an optional promo code in order to receive discounts. Warning: This only works if the lock is connected to a hook that will handle the promo codes. This cannot be used at the same time as the "Password Required" option above',
    })
    .optional(),
  emailRequired: z
    .boolean({
      description:
        'If enabled, the user will be prompted to enter an email which will be stored as metadata and be visible to any lock manager on the dashboard. Additionaly a confirmation email will be sent to the user once the NFT membership has been minted.',
    })
    .optional(),
  minRecipients: z.coerce
    .number({
      description:
        'During checkout, users can buy multiple memberships at once. You can set a minimum number they can buy.',
    })
    .int()
    .default(1)
    .nullable()
    .optional(),
  maxRecipients: z.coerce
    .number({
      description: `(Optional) Set the max number of memberships a user can purchase. Note: By default, checkout doesn't allow fiddling with quantity. You have to set maxRecipients to allow for changing to quantity.`,
    })
    .int()
    .default(1)
    .nullable()
    .optional(),
  default: z.boolean().optional(),
  dataBuilder: z
    .string({
      description:
        '(Optional) If set to a url, checkout will call the URL through a proxy with recipient, lockAddress, and network field for a json response containing data string field. This will be passed to the purchase function when user is claiming or buying the key as is. Make sure the returned data is valid bytes.',
    })
    .optional(),
  skipRecipient: z
    .boolean({
      description:
        'When set to true, the checkout flow will not let the user customize the recipient of the NFT membership.',
    })
    .default(true)
    .optional(),
  recipient: z
    .string({
      description:
        'Hardcoded address for the recipient of the NFT. Can be used with skipRecipient.',
    })
    .optional(),
})

export type PaywallLockConfigType = z.infer<typeof PaywallLockConfig>

export const PaywallConfig = z
  .object({
    title: z
      .string({
        description: 'Title for your checkout. This will show up on the head.',
      })
      .optional(),
    icon: z
      .string({
        description:
          'The URL for a icon to display in the top left corner of the modal.',
      })
      .optional(),
    locks: z.record(PaywallLockConfig),
    metadataInputs: z.array(MetadataInput).optional(),
    persistentCheckout: z
      .boolean({
        description:
          'If checked, the checkout modal cannot be closed. This is especially useful when the checkout UI is embedded directly. Leave unchecked if unsure.',
      })
      .optional(),
    redirectUri: z
      .string({
        description:
          'The address of a webpage where the user will be redirected when they complete the checkout flow.',
      })
      .url()
      .optional(),
    useDelegatedProvider: z.boolean().optional(),
    network: z.number().int().optional(),
    referrer: z
      .string({
        description:
          '(Recommended) The address of the purchase referrer. This address may receive a referrer fee if the lock was configured for this, and will receive Unlock Governance tokens if applicable. Put your address if unsure.',
      })
      .optional(),
    messageToSign: z
      .string({
        description:
          '(Optional) If supplied, the user is prompted to sign this message using their wallet. Your application needs to handle the signature to identify the user.',
      })
      .optional(),
    endingCallToAction: z
      .string({
        description:
          'Show a custom text on the final button that triggers a redirect',
      })
      .optional(),
    pessimistic: z
      .boolean({
        description:
          'By default, to reduce friction, we do not require users to wait for the transaction to be mined before offering them to be redirected. If you check this, users will need to wait for the transaction to have been mined in order to proceed to the next step.',
      })
      .default(true)
      .optional(),
    captcha: z
      .boolean({
        description:
          'If set true, the users will be prompted to go through a captcha during the checkout process. This is better used in conjunction with a purchase hook that verifies that captcha is valid.',
      })
      .optional(),
    minRecipients: z.coerce
      .number({
        description:
          'Set the minimum number of memberships a user needs to purchase.',
      })
      .int()
      .nullable()
      .optional(),
    maxRecipients: z.coerce
      .number({
        description: `(Optional) Set the max number of memberships a user can purchase. Note: By default, checkout doesn't allow fiddling with quantity. You have to set maxRecipients to allow for changing to quantity.`,
      })
      .int()
      .positive()
      .nullable()
      .optional(),
    hideSoldOut: z
      .boolean({
        description:
          'When enabled, sold out locks are not shown to users when they load the checkout modal.',
      })
      .optional(),
    password: z
      .boolean({
        description:
          'If enabled, the user will be prompted to enter a password in order to complete their purchases. Warning: This only works if the lock is connected to a hook that will handle the password verification.',
      })
      .optional(),
    promo: z
      .boolean({
        description:
          'If enabled, the user will be prompted to enter an optional promo code in order to receive discounts. Warning: This only works if the lock is connected to a hook that will handle the promo codes. This cannot be used at the same time as the "Password Required" option above',
      })
      .optional(),
    emailRequired: z
      .boolean({
        description:
          'If enabled, the user will be prompted to enter an email which will be stored as metadata and be visible to any lock manager on the dashboard. Additionaly a confirmation email will be sent to the user once the NFT membership has been minted.',
      })
      .optional(),
    dataBuilder: z
      .string({
        description:
          '(Optional) If set to a url, checkout will call the URL through a proxy with recipient, lockAddress, and network field for a json response containing data string field. This will be passed to the purchase function when user is claiming or buying the key as is. Make sure the returned data is valid bytes.',
      })
      .optional(),
    recurringPayments: z
      .union([z.string(), z.number()], {
        description:
          'The number of time a membership should be renewed automatically. This only applies to ERC20 locks.',
      })
      .optional(),
    skipRecipient: z
      .boolean({
        description:
          'When set to true, the checkout flow will not let the user customize the recipient of the NFT membership.',
      })
      .default(true)
      .optional(),
    skipSelect: z
      .boolean({
        description:
          'When set to true and there is only one lock, the checkout flow will skip the lock selection step.',
      })
      .default(false)
      .optional(),
    expectedAddress: z
      .string({
        description: 'Expected wallet address for user.',
      })
      .optional(),
    autoconnect: z
      .boolean({
        description:
          '(Advanced): forces the use the provider from the parent window when the checkout is embeded as an iframe.',
      })
      .default(false)
      .optional(),
    recipient: z
      .string({
        description:
          'Hardcoded address for the recipient of the NFT. Can be used with skipRecipient.',
      })
      .optional(),
  })
  .passthrough()

export type PaywallConfigType = z.infer<typeof PaywallConfig>
export const PaywallLocksConfig = z.record(z.string(), PaywallLockConfig)
export type PaywallLocksConfigType = z.infer<typeof PaywallLocksConfig>

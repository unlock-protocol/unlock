import { PaywallConfig, PaywallConfigLock } from '~/unlockTypes'

type Description = Partial<
  Record<keyof PaywallConfig | keyof PaywallConfigLock, string>
>

export const PaywallDescriptions: Description = {
  name: 'Name of the lock to display.',
  title: 'Title for your checkout. This will show up on the head.',
  icon: 'The URL for a icon to display in the top left corner of the modal.',
  persistentCheckout:
    'true if the modal cannot be closed, defaults to false when embedded. When closed, the user will be redirected to the redirect query param when using a purchase address (see above).',
  referrer:
    'The address which will receive UDT tokens (if the transaction is applicable)',
  messageToSign:
    'If supplied, the user is prompted to sign this message using their wallet. If using a checkout URL, a signature query param is then appended to the redirectUri (see above). If using the embedded paywall, the unlockProtocol.authenticated includes the signature attribute.',
  pessimistic:
    'By default, to reduce friction, we do not require users to wait for the transaction to be mined before offering them to be redirected. By setting this to true, users will need to wait for the transaction to have been mined in order to proceed to the next step.',
  recurringPayments:
    'The number of time a membership should be renewed automatically. This only applies to ERC20 locks.',
  metadataInputs: 'A set of input fields as explained there.',
  hideSoldOut:
    'When set to true, sold our locks are not shown to users when they load the checkout modal.',
  minRecipients:
    'Set the minimum number of memberships a user needs to purchase.',
  maxRecipients: `Set the max number of memberships a user can purchase. Note: By default, checkout doesn't allow fiddling with quantity. You have to set maxRecipients to allow for changing to quantity.`,
  emailRequired:
    'If set to true, the user will be prompted to enter an email which will be stored as metadata and be visible to any lock manager.',
  captcha:
    'If set true, the users will be prompted to go through a captcha during the checkout process. This is better used in conjunction with a purchase hook that verifies that captcha is valid.',
  password:
    'Defaults to false. If set to true, the user will be prompted to enter a password in order to complete their purchases. This will only be useful if the lock is connected to a hook that will handle the password verification.',
  dataBuilder:
    'If set to a url, checkout will call the URL through a proxy with recipient, lockAddress, and network field for a json response containing data string field. This will be passed to the purchase function when user is claiming or buying the key as is. Make sure the returned data is valid bytes.',
}

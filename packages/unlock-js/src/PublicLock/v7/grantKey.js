import grantKeys from './grantKeys'

export default async function (
  { lockAddress, recipient, expiration, keyManager },
  transactionOptions = {},
  callback
) {
  const events = await grantKeys.bind(this)(
    {
      lockAddress,
      recipients: [recipient],
      expirations: expiration ? [expiration] : [],
      keyManagers: keyManager ? [keyManager] : [],
    },
    transactionOptions,
    callback
  )

  if (events?.length) {
    return events[0]
  }

  return null
}

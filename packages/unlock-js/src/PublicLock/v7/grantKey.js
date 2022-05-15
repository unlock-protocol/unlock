import grantKeys from './grantKeys'

export default async function (
  { lockAddress, recipient, expiration, transactionOptions, keyManager },
  callback
) {
  const events = await grantKeys.bind(this)(
    {
      lockAddress,
      transactionOptions,
      recipients: [recipient],
      expirations: expiration ? [expiration] : [],
      keyManagers: keyManager ? [keyManager] : [],
    },
    callback
  )

  if (events?.length) {
    return events[0]
  }

  return null
}

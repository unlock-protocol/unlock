import grantKeys from './grantKeys'

export default async function (
  { lockAddress, recipient, expiration, transactionOptions },
  callback
) {
  const events = await grantKeys.bind(this)(
    {
      lockAddress,
      transactionOptions,
      recipients: [recipient],
      expirations: expiration ? [expiration] : [],
    },
    callback
  )

  if (events?.length) {
    return events[0]
  }

  return null
}

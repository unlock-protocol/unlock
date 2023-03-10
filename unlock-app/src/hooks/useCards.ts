// Taken from locksmith's userController/cards.test.ts
export function generateTypedData(message: any, messageKey: string) {
  return {
    types: {
      User: [{ name: 'publicKey', type: 'address' }],
    },
    domain: {
      name: 'Unlock',
      version: '1',
    },
    primaryType: 'User',
    message,
    messageKey,
  }
}

/**
 * yields a signature for typedDaata
 * @param walletService
 * @param typedData
 * @param address
 */
export const getSignature = async (
  walletService: any,
  typedData: any,
  address: string
) => {
  let signature
  if (typedData.message['Charge Card']) {
    const message = `I want to purchase a membership to ${typedData.message['Charge Card'].lock} for ${typedData.message['Charge Card'].publicKey} with my card.`
    signature = await walletService.signMessage(message, 'personal_sign')
  } else if (typedData.message['Get Card']) {
    const message = `I want to retrieve the card token for ${typedData.message['Get Card'].publicKey}`
    signature = await walletService.signMessage(message, 'personal_sign')
  } else if (typedData.message['Save Card']) {
    const message = `I save my payment card for my account ${typedData.message['Save Card'].publicKey}`
    signature = await walletService.signMessage(message, 'personal_sign')
  } else if (typedData.message['Delete Card']) {
    const message = `I am deleting the card linked to my account ${typedData.message['Delete Card'].publicKey}`
    signature = await walletService.signMessage(message, 'personal_sign')
  } else if (typedData.message['Claim Membership']) {
    const message = `I claim a membership for ${typedData.message['Claim Membership'].lock} to ${typedData.message['Claim Membership'].publicKey}`
    signature = await walletService.signMessage(message, 'personal_sign')
  } else {
    signature = await walletService.unformattedSignTypedData(address, typedData)
  }

  return signature
}

/**
 * @param walletService
 * @param address
 */
export const prepareCharge = async (
  config: any,
  walletService: any,
  address: string,
  stripeTokenId: string,
  network: number,
  lock: string,
  pricing: any,
  recipients: string[],
  recurring = 0
) => {
  const typedData = generateTypedData(
    {
      'Charge Card': {
        publicKey: address,
        userAddress: address,
        stripeTokenId,
        recipients,
        pricing,
        lock,
        network,
        recurring,
      },
    },
    'Charge Card'
  )

  const signature = await getSignature(walletService, typedData, address)

  const opts = {
    method: 'POST',
    headers: {
      Authorization: `Bearer-Simple ${Buffer.from(signature).toString(
        'base64'
      )}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(typedData),
  }
  const response = await fetch(
    `${config.services.storage.host}/purchase/prepare`,
    opts
  )
  return response.json()
}

/**
 * @param config
 * @param lock
 * @param network
 * @param address
 * @param recipients
 * @param paymentIntent
 * @returns
 */
export const captureCharge = async (
  config: any,
  lock: string,
  network: number,
  address: string,
  recipients: string[],
  paymentIntent: string
) => {
  const opts = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      lock,
      network,
      userAddress: address,
      recipients,
      paymentIntent,
    }),
  }
  const response = await fetch(
    `${config.services.storage.host}/purchase/capture`,
    opts
  )
  return response.json()
}

/**
 * DEPRECATED
 * @param config
 * @param walletService
 * @param address
 * @param network
 * @param lock
 * @param data
 * @param captcha
 * @returns
 */
export const claimMembership = async (
  config: any,
  walletService: any,
  address: string,
  network: number,
  lock: string,
  data?: string,
  captcha?: string
) => {
  const typedData = generateTypedData(
    {
      'Claim Membership': {
        publicKey: address,
        lock,
        network,
        data,
      },
    },
    'Claim Membership'
  )

  const signature = await getSignature(walletService, typedData, address)

  const opts = {
    method: 'POST',
    headers: {
      Authorization: `Bearer-Simple ${Buffer.from(signature).toString(
        'base64'
      )}`,
      'Content-Type': 'application/json',
      captcha: captcha || '',
    },
    body: JSON.stringify(typedData),
  }
  const response = await fetch(`${config.services.storage.host}/claim`, opts)
  return response.json()
}

/**
 * Deletes card for a given address
 * @param walletService
 * @param address
 */
export const deleteCardForAddress = async (
  config: any,
  walletService: any,
  address: string
) => {
  const typedData = generateTypedData(
    {
      'Delete Card': {
        publicKey: address,
      },
    },
    'Delete Card'
  )
  const signature = await getSignature(walletService, typedData, address)

  const opts = {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer-Simple ${Buffer.from(signature).toString(
        'base64'
      )}`,
      'Content-Type': 'application/json',
    },
  }

  const response = await fetch(
    `${config.services.storage.host}/users/${encodeURIComponent(
      address!
    )}/credit-cards?data=${JSON.stringify(typedData)}`,
    opts
  )

  const text = await response.text()

  return response.status === 202 && text
}

/**
 * Retrieves the pricing for a lock to be purchasable via credit card
 */
export const getFiatPricing = async (
  config: any,
  lock: string,
  network: number,
  quantity = 1
) => {
  const opts = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }
  const response = await fetch(
    `${config.services.storage.host}/price/fiat/${lock}?chain=${network}&quantity=${quantity}`,
    opts
  )
  return response.json()
}

export const getCardConnected = async (
  config: any,
  lock: string,
  network: number
) => {
  const opts = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }

  const response = await fetch(
    `${config.services.storage.host}/lock/${lock}/stripe-connected?chain=${network}`,
    opts
  )
  return response.json()
}

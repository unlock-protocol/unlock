import { isAddress as ethersIsAddress, isValidName } from 'ethers'

export const minifyAddress = (address: string) => {
  const checked = ethersIsAddress(address)
  return checked
    ? `${address.slice(0, 5)}...${address.slice(address.length - 5)}`
    : address
}

export const isAddress = (address = '') => {
  return ethersIsAddress(address)
}

// TODO: support other TLDs
export const isEns = (address = '') => {
  return address?.toLowerCase()?.includes('.eth')
}

export const isValidEnsName = (name = '') => {
  return isValidName(name.trim())
}

export const isAddressOrEns = (addressOrEns = '') => {
  return isEns(addressOrEns) || isAddress(addressOrEns)
}

export const unlockEmailSubscription = async (email: string) => {
  const EMAIL_SUBSCRIPTION_FORM = {
    portalId: '19942922',
    formGuid: '868101be-ae3e-422e-bc86-356c96939187',
  }

  const endpoint = `https://api.hsforms.com/submissions/v3/integration/submit/${EMAIL_SUBSCRIPTION_FORM.portalId}/${EMAIL_SUBSCRIPTION_FORM.formGuid}`
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: [
        {
          name: 'email',
          value: email,
        },
      ],
    }),
  }
  await fetch(endpoint, options)
}

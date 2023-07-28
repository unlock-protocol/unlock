import { ethers } from 'ethers'

export const minifyAddress = (address: string) => {
  const checked = ethers.utils.isAddress(address)
  return checked
    ? `${address.slice(0, 5)}...${address.slice(address.length - 5)}`
    : address
}

export const isAddressOrEns = (address = '') => {
  return (
    address?.toLowerCase()?.includes('.eth') || ethers.utils.isAddress(address)
  )
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

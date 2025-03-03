import { AirdropData } from '../../components/Campaigns'

/**
 * Checks if an address is eligible for an airdrop and returns the token amount
 * Fetches the recipients file and checks if the address exists in it
 */
export const isEligible = async (
  address: string,
  airdrop: AirdropData
): Promise<number> => {
  if (!airdrop.recipientsFile || !address) {
    return 0
  }
  const request = await fetch(airdrop.recipientsFile)
  const recipients = await request.json()
  const recipient = recipients.values.find((recipient: any) => {
    return recipient.value[0] === address
  })
  if (!recipient) {
    return 0
  }
  return recipient.value[1]
}

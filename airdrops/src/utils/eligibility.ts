import { ethers } from 'ethers'
import { AirdropData } from '../../components/Campaigns'

/**
 * Checks if an address is eligible for an airdrop and returns the token amount
 * This is a temporary implementation that randomly determines eligibility
 * To be replaced with actual implementation that checks against the recipients file
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
  return Number(ethers.formatUnits(recipient.value[1], airdrop.token.decimals))
}

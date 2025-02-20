/**
 * Checks if an address is eligible for an airdrop and returns the token amount
 * This is a temporary implementation that randomly determines eligibility
 * To be replaced with actual implementation that checks against the recipients file
 */
export const isEligible = async (
  address: string,
  recipientsFile: string
): Promise<number> => {
  // Temporary implementation: randomly determine eligibility
  const random = Math.random()

  // 40% chance of being eligible
  if (random < 0.4) {
    // Random amount between 100 and 1000 tokens
    return Math.floor(Math.random() * 900) + 100
  }

  return 0
}

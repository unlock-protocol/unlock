import * as z from 'zod'
import { config } from '~/config/app'
import { MembershipVerificationData } from '~/utils/verification'

interface Options {
  network: number
  owner: string
  manager: string
  keyId: string
  expiration: number
  isSignatureValid: boolean
  verificationData: z.infer<typeof MembershipVerificationData>
}

export function invalidMembership({
  network,
  owner,
  manager,
  keyId,
  expiration,
  isSignatureValid,
  verificationData,
}: Options) {
  const { account, tokenId } = verificationData

  const networkConfig = config.networks[network]

  if (!isSignatureValid) {
    return 'Signature does not match'
  }

  if (tokenId && keyId !== tokenId.toString()) {
    return 'This key does not match the user'
  }

  // When the key manager is our key manager contract, the owner can be different as the key
  // may have been transfered!
  if (
    networkConfig.keyManagerAddress &&
    manager.toLowerCase() !== networkConfig.keyManagerAddress.toLowerCase() &&
    owner.toLowerCase().trim() !== account.toLowerCase().trim()
  ) {
    return 'The current owner of this key does not match the QR code'
  }

  if (expiration != -1 && expiration < new Date().getTime() / 1000) {
    return 'This ticket has expired'
  }
  return
}

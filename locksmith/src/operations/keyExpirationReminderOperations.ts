import { KeyExpirationReminder } from '../models/keyExpirationReminder'
import * as Normalizer from '../utils/normalizer'

interface EmailNotificationProps {
  address: string
  network: number | string
  expiration: string
  tokenId: number | string
  type: string
}

/** Check if email notification is already sent and create a new record if not */
export const hasReminderAlreadySent = async ({
  address,
  network: networkId,
  expiration,
  tokenId: keyId,
  type,
}: EmailNotificationProps): Promise<boolean> => {
  const lockAddress = Normalizer.ethereumAddress(address)

  const values = {
    lockAddress,
    network: Number(networkId),
    expiration,
    tokenId: Number(keyId),
    type,
  }

  const [_emailNotification, created] =
    await KeyExpirationReminder.findOrCreate({
      where: {
        ...values,
      },
      defaults: {
        ...values,
      },
    })

  return !created
}

import {
  DEFAULT_LOCK_SETTINGS,
  LockSettingProps,
} from '../controllers/v2/lockSettingController'
import { LockSetting } from '../models/lockSetting'
import * as Normalizer from '../utils/normalizer'

interface SendEmailProps {
  lockAddress: string
  network: number
}

/**
 * Set if a Lock is enabled to send emails
 */
export async function saveSettings({
  lockAddress,
  network,
  sendEmail,
  replyTo,
  creditCardPrice,
}: SendEmailProps & LockSettingProps) {
  return await LockSetting.upsert(
    {
      lockAddress: Normalizer.ethereumAddress(lockAddress),
      network,
      sendEmail,
      replyTo,
      creditCardPrice,
    },
    {
      returning: true,
    }
  )
}

export async function getSettings({
  lockAddress,
  network,
}: {
  lockAddress: string
  network: number
}): Promise<LockSetting | LockSettingProps> {
  const settings = await LockSetting.findOne({
    where: {
      lockAddress: Normalizer.ethereumAddress(lockAddress),
      network,
    },
  })

  return settings || DEFAULT_LOCK_SETTINGS
}

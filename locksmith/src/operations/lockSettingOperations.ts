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
export async function saveSettings(options: SendEmailProps & LockSettingProps) {
  return await LockSetting.upsert(
    {
      // save rest of settings
      ...options,
      // normalize values
      lockAddress: Normalizer.ethereumAddress(options.lockAddress),
      slug: options?.slug?.toLowerCase().trim(),
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

export async function getLockSettingsBySlug(
  slug: string
): Promise<LockSetting | null> {
  const settings = await LockSetting.findOne({
    where: {
      slug: slug.toLowerCase().trim(),
    },
  })

  return settings || null
}

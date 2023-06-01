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
  includeProtected = false,
}: {
  lockAddress: string
  network: number
  includeProtected?: boolean
}): Promise<LockSetting | LockSettingProps> {
  const settings = await LockSetting.findOne({
    where: {
      lockAddress: Normalizer.ethereumAddress(lockAddress),
      network,
    },
  })

  const res = settings || DEFAULT_LOCK_SETTINGS

  if (includeProtected) {
    return res
  } else {
    // delete protected keys
    if (res.replyTo) {
      delete res.replyTo
    }
  }

  return res
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

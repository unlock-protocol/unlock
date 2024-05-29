import {
  DEFAULT_LOCK_SETTINGS,
  LockSettingProps,
} from '../controllers/v2/lockSettingController'
import { LockSetting } from '../models/lockSetting'
import * as Normalizer from '../utils/normalizer'
import { protectedAttributes } from '../utils/protectedAttributes'
import { getEventForLock } from './eventOperations'

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
  // list of array of keys to exclude
  const attributesExcludes = includeProtected ? [] : protectedAttributes

  const settings = await LockSetting.findOne({
    where: {
      lockAddress: Normalizer.ethereumAddress(lockAddress),
      network,
    },
    attributes: {
      exclude: attributesExcludes,
    },
  })

  const lockSettings = settings || { ...DEFAULT_LOCK_SETTINGS }

  const eventDetails = await getEventForLock(
    lockAddress,
    network,
    includeProtected
  )
  if (eventDetails?.data) {
    if (eventDetails?.data.replyTo) {
      lockSettings.replyTo = eventDetails.data.replyTo
    }
    if (eventDetails?.data.emailSender) {
      lockSettings.emailSender = eventDetails.data.emailSender
    }
  }

  attributesExcludes.forEach((attr) => {
    // @ts-expect-error Element implicitly has an 'any' type because expression of type 'string' can't be used to index type
    delete lockSettings[attr]
  })

  return lockSettings
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

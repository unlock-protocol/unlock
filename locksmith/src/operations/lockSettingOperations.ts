import {
  DEFAULT_LOCK_SETTINGS,
  LockSettingProps,
} from '../controllers/v2/lockSettingContoller'
import { LockSetting } from '../models/lockSetting'

interface SendEmailProps {
  lockAddress: string
  network: number
  sendEmail: boolean
}

/**
 * Set if a Lock is enabled to send emails
 */
export async function saveSettings({
  lockAddress,
  network,
  sendEmail,
}: SendEmailProps) {
  return await LockSetting.upsert(
    {
      lockAddress,
      network,
      sendEmail,
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
      lockAddress,
      network,
    },
  })

  return settings || DEFAULT_LOCK_SETTINGS
}

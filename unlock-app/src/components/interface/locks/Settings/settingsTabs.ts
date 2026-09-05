import type { SettingTab } from '~/components/content/lock/LocksSettingsContent'

export type VisibleSettingTab = Extract<
  SettingTab,
  | 'general'
  | 'terms'
  | 'payments'
  | 'roles'
  | 'emails'
  | 'discount-codes'
  | 'advanced'
>

interface LockPrice {
  keyPrice?: string | number | null
}

export const isPaidLock = (lock?: LockPrice) => {
  const price = Number(lock?.keyPrice ?? 0)

  return Number.isFinite(price) && price > 0
}

export const getVisibleSettingTabIds = (
  lock?: LockPrice
): VisibleSettingTab[] => {
  const tabIds: VisibleSettingTab[] = [
    'general',
    'terms',
    'payments',
    'roles',
    'emails',
  ]

  if (isPaidLock(lock)) {
    tabIds.push('discount-codes')
  }

  tabIds.push('advanced')

  return tabIds
}

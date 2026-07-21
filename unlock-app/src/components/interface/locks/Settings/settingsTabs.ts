interface DiscountCodesTabLock {
  keyPrice?: number | string | null
}

interface ShouldShowDiscountCodesTabProps {
  isLoading: boolean
  lock?: DiscountCodesTabLock
}

export const shouldShowDiscountCodesTab = ({
  isLoading,
  lock,
}: ShouldShowDiscountCodesTabProps) => {
  if (isLoading || lock?.keyPrice === undefined || lock?.keyPrice === null) {
    return false
  }

  const keyPrice = Number(lock.keyPrice)
  return Number.isFinite(keyPrice) && keyPrice > 0
}

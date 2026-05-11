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

  return Number(lock.keyPrice) > 0
}

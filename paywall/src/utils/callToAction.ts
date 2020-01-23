import { KeyStatus, PaywallCallToAction } from '../unlockTypes'

// status is assumed to be the "highest" rank key status of all keys
// available, as determined by getHighestStatus in the keys utils
// Returns the default call to action if any is missing, because that
// one is required and will always be present.
export function getCallToAction(
  ctas: PaywallCallToAction,
  status: KeyStatus
): string {
  switch (status) {
    case KeyStatus.VALID:
    case KeyStatus.CONFIRMING:
      return ctas.confirmed || ctas.default
    case KeyStatus.PENDING:
    case KeyStatus.SUBMITTED:
      return ctas.pending || ctas.default
    case KeyStatus.EXPIRED:
      return ctas.expired || ctas.default
    default:
      return ctas.default
  }
}

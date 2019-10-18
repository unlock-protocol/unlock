export const GOT_RECOVERY_PHRASE = 'recovery/GOT_RECOVERY_PHRASE'
export const RESET_RECOVERY_PHRASE = 'recovery/RESET_RECOVERY_PHRASE'

export const gotRecoveryPhrase = (recoveryPhrase: string) => ({
  type: GOT_RECOVERY_PHRASE,
  recoveryPhrase,
})

export const resetRecoveryPhrase = () => ({
  type: RESET_RECOVERY_PHRASE,
})

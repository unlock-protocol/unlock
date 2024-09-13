export const getCheckInTime = (
  checkInTimestamp: string | null,
  metadata: any
): string | null => {
  if (checkInTimestamp) {
    // checked in from this UI
    return checkInTimestamp
  }
  // Check the metadata
  const [_, checkInTimeValue] =
    Object.entries(metadata)?.find(([key]) => key === 'checkedInAt') ?? []
  if (!checkInTimeValue) {
    return null
  }
  if (Array.isArray(checkInTimeValue)) {
    // Multiple check ins
    return new Date(
      checkInTimeValue[checkInTimeValue.length - 1] as number
    ).toLocaleString()
  }
  // single checkin
  return new Date(checkInTimeValue as number).toLocaleString()
}

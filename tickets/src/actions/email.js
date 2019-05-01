export const SEND_CONFIRMATION = 'email/SEND_CONFIRMATION'

export const sendConfirmation = (
  recipient,
  ticket,
  eventName,
  eventDate,
  confirmLink
) => ({
  type: SEND_CONFIRMATION,
  recipient,
  ticket,
  eventName,
  eventDate,
  confirmLink,
})

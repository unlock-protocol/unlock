export default {
  subject: () => 'Please confirm your account recovery',
  text: (params) =>
    `We received a request to recover your account using your recovery key.

If you did not make this request, please disregard this email. Otherwise, please click on the following link to confirm your account recovery request:

  ${params.recoveryKeyConfirmLink}

If you have any questions, you can always email us at hello@unlock-protocol.com.

The Unlock team
`,
}

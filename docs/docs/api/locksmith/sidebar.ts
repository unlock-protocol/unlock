import type { SidebarsConfig } from '@docusaurus/plugin-content-docs'

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: 'doc',
      id: 'api/locksmith/unlock-locksmith',
    },
    {
      type: 'category',
      label: 'UNTAGGED',
      items: [
        {
          type: 'doc',
          id: 'api/locksmith/nonce',
          label: 'nonce',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/login',
          label: 'login',
          className: 'api-method post',
        },
        {
          type: 'doc',
          id: 'api/locksmith/login-with-privy',
          label: 'loginWithPrivy',
          className: 'api-method post',
        },
        {
          type: 'doc',
          id: 'api/locksmith/logout',
          label: 'logout',
          className: 'api-method post',
        },
        {
          type: 'doc',
          id: 'api/locksmith/revoke',
          label: 'revoke',
          className: 'api-method post',
        },
        {
          type: 'doc',
          id: 'api/locksmith/user',
          label: 'user',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/applications',
          label: 'applications',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/create-application',
          label: 'createApplication',
          className: 'api-method post',
        },
        {
          type: 'doc',
          id: 'api/locksmith/delete-application',
          label: 'deleteApplication',
          className: 'api-method delete',
        },
        {
          type: 'doc',
          id: 'api/locksmith/update-application',
          label: 'updateApplication',
          className: 'api-method put',
        },
        {
          type: 'doc',
          id: 'api/locksmith/verifiers',
          label: 'verifiers',
          className: 'menu__list-item--deprecated api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/create-verifier',
          label: 'createVerifier',
          className: 'menu__list-item--deprecated api-method put',
        },
        {
          type: 'doc',
          id: 'api/locksmith/delete-verifier',
          label: 'deleteVerifier',
          className: 'menu__list-item--deprecated api-method delete',
        },
        {
          type: 'doc',
          id: 'api/locksmith/verifier',
          label: 'verifier',
          className: 'menu__list-item--deprecated api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/event-verifiers',
          label: 'eventVerifiers',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/add-event-verifier',
          label: 'addEventVerifier',
          className: 'api-method put',
        },
        {
          type: 'doc',
          id: 'api/locksmith/delete-event-verifier',
          label: 'deleteEventVerifier',
          className: 'api-method delete',
        },
        {
          type: 'doc',
          id: 'api/locksmith/approve-refunds',
          label: 'approveRefunds',
          className: 'api-method post',
        },
        {
          type: 'doc',
          id: 'api/locksmith/approved-refunds',
          label: 'approvedRefunds',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/sign-ticket',
          label: 'signTicket',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/check-ticket',
          label: 'checkTicket',
          className: 'menu__list-item--deprecated api-method put',
        },
        {
          type: 'doc',
          id: 'api/locksmith/check-event-ticket',
          label: 'checkEventTicket',
          className: 'api-method put',
        },
        {
          type: 'doc',
          id: 'api/locksmith/get-event-ticket',
          label: 'getEventTicket',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/email-ticket',
          label: 'emailTicket',
          className: 'api-method post',
        },
        {
          type: 'doc',
          id: 'api/locksmith/ticket-qr-code',
          label: 'ticketQRCode',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/ticket-verification-url',
          label: 'ticketVerificationUrl',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/lock-metadata',
          label: 'lockMetadata',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/update-lock-metadata',
          label: 'updateLockMetadata',
          className: 'api-method put',
        },
        {
          type: 'doc',
          id: 'api/locksmith/key-metadata',
          label: 'keyMetadata',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/update-key-metadata',
          label: 'updateKeyMetadata',
          className: 'api-method put',
        },
        {
          type: 'doc',
          id: 'api/locksmith/update-user-metadata',
          label: 'updateUserMetadata',
          className: 'api-method put',
        },
        {
          type: 'doc',
          id: 'api/locksmith/get-user-metadata',
          label: 'getUserMetadata',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/update-users-metadata',
          label: 'updateUsersMetadata',
          className: 'api-method put',
        },
        {
          type: 'doc',
          id: 'api/locksmith/get-waas-token',
          label: 'getWaasToken',
          className: 'api-method post',
        },
        {
          type: 'doc',
          id: 'api/locksmith/get-user-account-type',
          label: 'getUserAccountType',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/send-verification-code',
          label: 'sendVerificationCode',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/verify-email-code',
          label: 'verifyEmailCode',
          className: 'api-method post',
        },
        {
          type: 'doc',
          id: 'api/locksmith/update-user-encrypted-private-key',
          label: 'updateUserEncryptedPrivateKey',
          className: 'api-method put',
        },
        {
          type: 'doc',
          id: 'api/locksmith/get-user-private-key',
          label: 'getUserPrivateKey',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/get-user-recovery-phrase',
          label: 'getUserRecoveryPhrase',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/eject-user',
          label: 'ejectUser',
          className: 'api-method post',
        },
        {
          type: 'doc',
          id: 'api/locksmith/get-data-for-recipients-and-captcha',
          label: 'getDataForRecipientsAndCaptcha',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/keys',
          label: 'keys',
          className: 'menu__list-item--deprecated api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/keys-by-page',
          label: 'keysByPage',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/export-keys',
          label: 'exportKeys',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/get-exported-keys',
          label: 'getExportedKeys',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/balance',
          label: 'balance',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/price',
          label: 'price',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/create-lock-contract',
          label: 'createLockContract',
          className: 'api-method post',
        },
        {
          type: 'doc',
          id: 'api/locksmith/purchase',
          label: 'purchase',
          className: 'api-method post',
        },
        {
          type: 'doc',
          id: 'api/locksmith/cancel-subscription',
          label: 'cancelSubscription',
          className: 'api-method delete',
        },
        {
          type: 'doc',
          id: 'api/locksmith/get-subscription',
          label: 'getSubscription',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/claim',
          label: 'claim',
          className: 'api-method post',
        },
        {
          type: 'doc',
          id: 'api/locksmith/setup-payment',
          label: 'setupPayment',
          className: 'api-method post',
        },
        {
          type: 'doc',
          id: 'api/locksmith/list-payment-methods',
          label: 'listPaymentMethods',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/generate-ticket',
          label: 'generateTicket',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/get-ticket',
          label: 'getTicket',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/disconnect-stripe',
          label: 'disconnectStripe',
          className: 'api-method delete',
        },
        {
          type: 'doc',
          id: 'api/locksmith/get-lock-stripe-connection-details',
          label: 'getLockStripeConnectionDetails',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/upload-images',
          label: 'uploadImages',
          className: 'api-method post',
        },
        {
          type: 'doc',
          id: 'api/locksmith/create-transfer-code',
          label: 'createTransferCode',
          className: 'api-method post',
        },
        {
          type: 'doc',
          id: 'api/locksmith/transfer-done',
          label: 'transferDone',
          className: 'api-method post',
        },
        {
          type: 'doc',
          id: 'api/locksmith/get-receipts-status',
          label: 'getReceiptsStatus',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/create-download-receipts-request',
          label: 'createDownloadReceiptsRequest',
          className: 'api-method post',
        },
        {
          type: 'doc',
          id: 'api/locksmith/download-receipts',
          label: 'downloadReceipts',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/get-receipts',
          label: 'getReceipts',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/get-receipt',
          label: 'getReceipt',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/save-receipt',
          label: 'saveReceipt',
          className: 'api-method post',
        },
        {
          type: 'doc',
          id: 'api/locksmith/get-receipts-base',
          label: 'getReceiptsBase',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/save-receipts-base',
          label: 'saveReceiptsBase',
          className: 'api-method post',
        },
        {
          type: 'doc',
          id: 'api/locksmith/get-custom-email-content',
          label: 'getCustomEmailContent',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/save-custom-email-content',
          label: 'saveCustomEmailContent',
          className: 'api-method post',
        },
        {
          type: 'doc',
          id: 'api/locksmith/delete-checkout-config',
          label: 'deleteCheckoutConfig',
          className: 'api-method delete',
        },
        {
          type: 'doc',
          id: 'api/locksmith/get-checkout-config',
          label: 'getCheckoutConfig',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/update-checkout-config',
          label: 'updateCheckoutConfig',
          className: 'api-method put',
        },
        {
          type: 'doc',
          id: 'api/locksmith/list-checkout-configs',
          label: 'listCheckoutConfigs',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/remove-payment-methods',
          label: 'removePaymentMethods',
          className: 'api-method delete',
        },
        {
          type: 'doc',
          id: 'api/locksmith/is-card-payment-enabled-for-lock',
          label: 'isCardPaymentEnabledForLock',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/connect-stripe-account',
          label: 'connectStripeAccount',
          className: 'api-method post',
        },
        {
          type: 'doc',
          id: 'api/locksmith/get-stripe-connections',
          label: 'getStripeConnections',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/get-event-details',
          label: 'getEventDetails',
          className: 'menu__list-item--deprecated api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/get-lock-settings-by-slug',
          label: 'getLockSettingsBySlug',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/get-lock-settings',
          label: 'getLockSettings',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/save-lock-setting',
          label: 'saveLockSetting',
          className: 'api-method post',
        },
        {
          type: 'doc',
          id: 'api/locksmith/generate-certificate',
          label: 'generateCertificate',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/get-data-for-recipients-and-guild',
          label: 'getDataForRecipientsAndGuild',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/get-data-for-recipients-and-gitcoin-passport',
          label: 'getDataForRecipientsAndGitcoinPassport',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/capture-purchase',
          label: 'capturePurchase',
          className: 'api-method post',
        },
        {
          type: 'doc',
          id: 'api/locksmith/get-charges-for-lock',
          label: 'getChargesForLock',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/check-claim',
          label: 'checkClaim',
          className: 'api-method post',
        },
        {
          type: 'doc',
          id: 'api/locksmith/unsubscribe-email',
          label: 'unsubscribeEmail',
          className: 'api-method post',
        },
        {
          type: 'doc',
          id: 'api/locksmith/re-subscribe-email',
          label: 'reSubscribeEmail',
          className: 'api-method post',
        },
        {
          type: 'doc',
          id: 'api/locksmith/send-custom-email',
          label: 'sendCustomEmail',
          className: 'api-method post',
        },
        {
          type: 'doc',
          id: 'api/locksmith/send-event-invites',
          label: 'sendEventInvites',
          className: 'api-method post',
        },
        {
          type: 'doc',
          id: 'api/locksmith/save-event-data',
          label: 'saveEventData',
          className: 'api-method post',
        },
        {
          type: 'doc',
          id: 'api/locksmith/get-event',
          label: 'getEvent',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/rsvp',
          label: 'rsvp',
          className: 'api-method post',
        },
        {
          type: 'doc',
          id: 'api/locksmith/approve-rsvp',
          label: 'approveRsvp',
          className: 'menu__list-item--deprecated api-method post',
        },
        {
          type: 'doc',
          id: 'api/locksmith/deny-rsvp',
          label: 'denyRsvp',
          className: 'menu__list-item--deprecated api-method post',
        },
        {
          type: 'doc',
          id: 'api/locksmith/approve-attendees-rsvp',
          label: 'approveAttendeesRsvp',
          className: 'api-method post',
        },
        {
          type: 'doc',
          id: 'api/locksmith/deny-attendees-rsvp',
          label: 'denyAttendeesRsvp',
          className: 'api-method post',
        },
        {
          type: 'doc',
          id: 'api/locksmith/generate-apple-wallet-pass',
          label: 'generateAppleWalletPass',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/generate-google-wallet-pass',
          label: 'generateGoogleWalletPass',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/create-event-collection',
          label: 'createEventCollection',
          className: 'api-method post',
        },
        {
          type: 'doc',
          id: 'api/locksmith/get-event-collection',
          label: 'getEventCollection',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/update-event-collection',
          label: 'updateEventCollection',
          className: 'api-method put',
        },
        {
          type: 'doc',
          id: 'api/locksmith/add-event-to-collection',
          label: 'addEventToCollection',
          className: 'api-method post',
        },
        {
          type: 'doc',
          id: 'api/locksmith/get-events-in-collection',
          label: 'getEventsInCollection',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/remove-event-from-collection',
          label: 'removeEventFromCollection',
          className: 'api-method delete',
        },
        {
          type: 'doc',
          id: 'api/locksmith/add-manager-to-event-collection',
          label: 'addManagerToEventCollection',
          className: 'api-method post',
        },
        {
          type: 'doc',
          id: 'api/locksmith/remove-manager-from-event-collection',
          label: 'removeManagerFromEventCollection',
          className: 'api-method delete',
        },
        {
          type: 'doc',
          id: 'api/locksmith/get-unapproved-events-for-collection',
          label: 'getUnapprovedEventsForCollection',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/locksmith/approve-event',
          label: 'approveEvent',
          className: 'api-method post',
        },
        {
          type: 'doc',
          id: 'api/locksmith/bulk-approve-events',
          label: 'bulkApproveEvents',
          className: 'api-method post',
        },
        {
          type: 'doc',
          id: 'api/locksmith/bulk-remove-events',
          label: 'bulkRemoveEvents',
          className: 'api-method delete',
        },
        {
          type: 'doc',
          id: 'api/locksmith/check-privy-user',
          label: 'checkPrivyUser',
          className: 'api-method post',
        },
      ],
    },
  ],
}

export default sidebar.apisidebar

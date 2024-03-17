const en = {
  common: {
    welcome: 'Hello to Unlock Protocol',
    free: 'FREE',
    continue: 'Continue',
    continuing: 'Continuing',
    next: 'Next',
    sign_message: 'Sign the message',
    email: 'Email',
    wallet: 'Wallet',
    change: 'Change',
    description: {
      enter_email:
        'Enter the email address that will receive the membership NFT',
      enter_wallet:
        'Enter the wallet address that will receive the membership NFT',
      email: 'The email address that will receive the membership NFT',
      wallet: 'The wallet address that will receive the membership NFT',
    },
    pay_via_card: 'Pay via card',
    payment_method: 'Use cards, Google Pay, or Apple Pay.',
    additional_fees: 'Additional fees may apply.',
    pay_with: 'Pay with',
    your_balance: 'Your balance of',
    on: 'on',
    use_your_card: 'Use your card with Crossmint.',
    pay_via_stripe: 'Pay via Stripe',
    swap: 'Swap',
    for: 'for',
    and: 'and',
    pay: 'pay',
    decent: 'Decent',
    ready_to_get_wallet:
      ' Ready to get your own wallet to purchase this membership with cryptocurrency?',
    click_here: 'Click here',
    skip: 'Skip',
    quantity: 'Quantity',
    duration: 'Duration',
    sold_out: 'Sold out',
    buy: 'Buy',
    memberships: 'memberships',
    memberships_at_once: 'memberships at once',
    buy_more: 'Buy more',
  },
  warnings: {
    email_required: 'Email is required',
    wallet_required: 'Wallet Address is required',
    address_max: 'Address already holds the maximum number of memberships.',
  },
  errors: {
    problem_address: 'There is a problem with using this address. Try another.',
    no_wallet: 'No wallet address?',
    transaction_failed: 'Transaction failed',
    transaction_error: 'There was an error when preparing the transaction.',
    wrong_password: 'Wrong password...',
    gas_not_enough: `You don't have enough`,
    for_gas_fee: 'for gas fee',
    credit_card_not_enabled: 'Credit card is not enabled for this membership',
    purchase_more_fail: 'You cannot purchase more than',
    purchase_less_fail: 'You cannot purchase less than',
  },
  captcha: {
    Solve_the_captcha: 'Solve the captcha to continue',
    Captcha: 'Captcha',
  },
  guild: {
    wallet_warning_1: 'Your wallet address ',
    wallet_warning_2: 'is not on the list of approved attendees for this',
    farcon: 'FarCon',
    class_of_tickets: 'class of tickets.',
    check:
      '   Please check that you have been approved and use the address linked to your Farcaster account.',
    check_again: 'Check again',
    wallet_approve: 'Your wallet is on the list of approved attendees!',
    membership_restrict:
      'Memberships to this lock are restricted to addresses that belong to the',
    recipient_restrict:
      ' Some of the recipients that you have selected are not members of the Guild.',
    guild: 'guild',
    join: 'Join the Guild',
  },
  minting: {
    minting_nft: 'Minting NFT',
    airdrop: '   We will airdrop this free membership to you!',
    claim_membership: 'Claim Membership for free',
  },
  password: {
    enter_password: 'Enter password',
    description:
      'You need to enter the password to purchase the key. If password is wrong, purchase will fail.',
    submit_password: 'Submit password',
  },
  loading: {
    loading_more: 'Loading more payment options...',
  },
  promo: {
    discount: 'Discount',
    code_expired: 'Code expired',
    enter_promo_code: 'Enter promo code',
    enter_promo_code_description:
      'If you have a promo code to receive discounts, please enter it now.s',
  },
  success: {
    viola: ' Voila! This is unlocked!',
    block_explorer: 'See in the block explorer',
    add_to_google_wallet: 'Add to Google Wallet',
    add_to_apple_wallet: 'Add to Apple Wallet',
    apple_wallet: 'Apple Wallet',
    google_wallet: 'Google Wallet',
  },
}
export default en
export type Translations = typeof en

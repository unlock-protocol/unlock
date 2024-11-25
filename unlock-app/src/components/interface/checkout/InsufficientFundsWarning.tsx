interface InsufficientFundsWarningProps {
  enableCreditCard: boolean
  onFundWallet: () => void
}

const InsufficientFundsWarning = ({
  enableCreditCard,
  onFundWallet,
}: InsufficientFundsWarningProps) => {
  return (
    <div
      onClick={!enableCreditCard ? onFundWallet : undefined}
      className="mt-4 text-sm py-5 px-4 bg-red-200 rounded-lg border border-gray-200 cursor-pointer"
    >
      You don&apos;t have enough funds in your wallet to pay for this
      membership.{' '}
      {enableCreditCard
        ? 'You can proceed to pay with a credit card.'
        : 'Please add funds to your wallet to continue.'}
    </div>
  )
}

export default InsufficientFundsWarning

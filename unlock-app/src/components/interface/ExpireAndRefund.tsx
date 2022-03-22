import React, { useState } from 'react'
import styles from './ExpireAndRefund.module.scss'

interface ExpireAndRefundProps {}

export const ExpireAndRefund: React.FC<ExpireAndRefundProps> = () => {
  const [refundAmount, setRefundAmount] = useState(0)

  const onAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRefundAmount(parseFloat(e.target.value))
  }

  const onExpireAndRefund = () => {}

  return (
    <div className={styles.expireAndRefund}>
      <small>Set the amount you want to refund</small>
      <input
        type="number"
        step="0.01"
        value={refundAmount}
        onChange={onAmountChange}
        min={0}
      />
      <button type="button" onClick={onExpireAndRefund}>
        Expire and Refund
      </button>
    </div>
  )
}

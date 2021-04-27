import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { TransactionType } from '../../unlockTypes'
import LockIconBar from '../../components/creator/lock/LockIconBar'
import { ConfigContext } from '../../utils/withConfig'

const config = {
  requiredConfirmations: 12,
}

const transactions = {
  '0xpending': {
    hash: '0xpending',
    status: 'pending',
    lock: '0xpendingLock',
    type: TransactionType.LOCK_CREATION,
  },
  '0xsubmitted': {
    hash: '0xsubmitted',
    status: 'submitted',
    lock: '0xsubmittedLock',
    type: TransactionType.LOCK_CREATION,
  },
  '0xconfirming': {
    hash: '0xconfirming',
    status: 'mined',
    confirmations: config.requiredConfirmations - 1,
    lock: '0xconfirmingLock',
    type: TransactionType.LOCK_CREATION,
  },
  '0xmined': {
    hash: '0xmined',
    status: 'mined',
    confirmations: config.requiredConfirmations + 1,
    lock: '0xmined',
    type: TransactionType.LOCK_CREATION,
  },
  '0xpendingPriceChange': {
    hash: '0xpendingPriceChange',
    status: 'pending',
    lock: '0xpendingPriceChangeLock',
    type: TransactionType.UPDATE_KEY_PRICE,
  },
  '0xsubmittedPriceChange': {
    hash: '0xsubmittedPriceChange',
    status: 'submitted',
    lock: '0xsubmittedPriceChangeLock',
    type: TransactionType.UPDATE_KEY_PRICE,
  },
  '0xconfirmingPriceChange': {
    hash: '0xconfirmingPriceChange',
    status: 'mined',
    confirmations: config.requiredConfirmations - 1,
    lock: '0xconfirmingPriceChangeLock',
    type: TransactionType.UPDATE_KEY_PRICE,
  },
  '0xminedPriceChange': {
    hash: '0xminedPriceChange',
    status: 'mined',
    confirmations: config.requiredConfirmations + 1,
    lock: '0xminedPriceChange',
    type: TransactionType.UPDATE_KEY_PRICE,
  },

  '0xpendingWithdrawal': {
    hash: '0xpendingWithdrawal',
    status: 'pending',
    lock: '0xpendingWithdrawalLock',
    type: TransactionType.WITHDRAWAL,
  },
  '0xsubmittedWithdrawal': {
    hash: '0xsubmittedWithdrawal',
    status: 'submitted',
    lock: '0xsubmittedWithdrawalLock',
    type: TransactionType.WITHDRAWAL,
  },
  '0xconfirmingWithdrawal': {
    hash: '0xconfirmingWithdrawal',
    status: 'mined',
    confirmations: config.requiredConfirmations - 1,
    lock: '0xconfirmingWithdrawalLock',
    type: TransactionType.WITHDRAWAL,
  },
  '0xminedWithdrawal': {
    hash: '0xminedWithdrawal',
    status: 'mined',
    confirmations: config.requiredConfirmations + 1,
    lock: '0xminedWithdrawal',
    type: TransactionType.WITHDRAWAL,
  },
}
const ConfigProvider = ConfigContext.Provider

storiesOf('LockIconBar', module)
  .addDecorator((getStory) => (
    <ConfigProvider value={config}>{getStory()}</ConfigProvider>
  ))
  .add('LockIconBar, no blocking transaction', () => {
    const lock = {
      address: '0xnoTransaction',
    }
    return (
      <LockIconBar
        lock={lock}
        toggleCode={action('toggleCode')}
        edit={action('edit')}
      />
    )
  })
  .add('LockIconBar, pending lock creation transaction', () => {
    const lock = {
      address: '0xpendingLock',
    }
    return (
      <LockIconBar
        lock={lock}
        toggleCode={action('toggleCode')}
        edit={action('edit')}
      />
    )
  })
  .add('LockIconBar, submitted transaction', () => {
    const lock = {
      address: '0xsubmittedLock',
    }
    return (
      <LockIconBar
        lock={lock}
        toggleCode={action('toggleCode')}
        edit={action('edit')}
      />
    )
  })
  .add('LockIconBar, confirming transaction', () => {
    const lock = {
      address: '0xconfirmingLock',
    }
    return (
      <LockIconBar
        lock={lock}
        toggleCode={action('toggleCode')}
        edit={action('edit')}
      />
    )
  })
  .add('LockIconBar, mined transaction', () => {
    const lock = {
      address: '0xmined',
    }
    return (
      <LockIconBar
        lock={lock}
        toggleCode={action('toggleCode')}
        edit={action('edit')}
      />
    )
  })
  .add('LockIconBar, pending price change transaction', () => {
    const lock = {
      address: '0xpendingPriceChangeLock',
    }
    return (
      <LockIconBar
        lock={lock}
        toggleCode={action('toggleCode')}
        edit={action('edit')}
      />
    )
  })
  .add('LockIconBar, submitted price change transaction', () => {
    const lock = {
      address: '0xsubmittedPriceChangeLock',
    }
    return (
      <LockIconBar
        lock={lock}
        toggleCode={action('toggleCode')}
        edit={action('edit')}
      />
    )
  })
  .add('LockIconBar, confirming price change transaction', () => {
    const lock = {
      address: '0xconfirmingPriceChangeLock',
    }
    return (
      <LockIconBar
        lock={lock}
        toggleCode={action('toggleCode')}
        edit={action('edit')}
      />
    )
  })
  .add('LockIconBar, mined price change transaction', () => {
    const lock = {
      address: '0xmined',
    }
    return (
      <LockIconBar
        lock={lock}
        toggleCode={action('toggleCode')}
        edit={action('edit')}
      />
    )
  })
  .add('LockIconBar, pending withdrawal transaction', () => {
    const lock = {
      address: '0xpendingWithdrawalLock',
    }
    return (
      <LockIconBar
        lock={lock}
        toggleCode={action('toggleCode')}
        edit={action('edit')}
      />
    )
  })
  .add('LockIconBar, submitted withdrawal transaction', () => {
    const lock = {
      address: '0xsubmittedWithdrawalLock',
    }
    return (
      <LockIconBar
        lock={lock}
        toggleCode={action('toggleCode')}
        edit={action('edit')}
      />
    )
  })
  .add('LockIconBar, confirming withdrawal transaction', () => {
    const lock = {
      address: '0xconfirmingWithdrawalLock',
    }
    return (
      <LockIconBar
        lock={lock}
        toggleCode={action('toggleCode')}
        edit={action('edit')}
      />
    )
  })
  .add('LockIconBar, mined withdrawal transaction', () => {
    const lock = {
      address: '0xminedWithdrawal',
    }
    return (
      <LockIconBar
        lock={lock}
        toggleCode={action('toggleCode')}
        edit={action('edit')}
      />
    )
  })

import React from 'react'
import { storiesOf } from '@storybook/react'
import { actions } from '@storybook/addon-actions'
import { Lock } from '../../components/lock/Lock'
import { ConfigContext } from '../../utils/withConfig'
import { UNLIMITED_KEYS_COUNT } from '../../constants'
import { WindowContext } from '../../hooks/browser/useWindow'
import configure from '../../config'

// lock, account, keys, purchaseKey
const lockActions = actions({
  hideModal: 'hide',
  purchaseKey: 'purchase',
  showModal: 'show',
})
const config = {
  requiredConfirmations: 3,
  isInIframe: false,
  isServer: false,
}
const fakeWindow = {
  location: {
    href: '/',
    pathname: '',
    search: '',
    hash: '',
  },
}

const lock = {
  address: '0x123',
  name: 'Monthly',
  keyPrice: '0.23',
  expirationDuration: 2592000,
}

const lockWithLongName = {
  address: '0x123',
  name: 'Hitting406 Crypto Category',
  keyPrice: '0.23',
  expirationDuration: 2592000,
}

const soldOutLock = {
  maxNumberOfKeys: 1,
  outstandingKeys: 1,
  ...lock,
}

const ConfigProvider = ConfigContext.Provider
const WindowProvider = WindowContext.Provider

const storyConfig = configure()

const accountWithBalance = {
  balance: {
    eth: '9001',
    '0x123ERC20': '9001',
    [storyConfig.erc20Contract.address]: '9001',
  },
}

storiesOf('Lock', module)
  .addDecorator(getStory => (
    <ConfigProvider value={storyConfig}>
      <WindowProvider value={fakeWindow}>{getStory()}</WindowProvider>
    </ConfigProvider>
  ))
  .addDecorator(getStory => (
    <div
      style={{
        backgroundColor: 'var(--offwhite)',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'row',
        placeContent: 'center',
      }}
    >
      <div
        style={{
          height: '200px',
          display: 'grid',
        }}
      >
        {getStory()}
      </div>
    </div>
  ))
  .add('with no key, ERC20 Lock, known currency', () => {
    const erc20Lock = {
      currencyContractAddress: storyConfig.erc20Contract.address,
      address: '0x123',
      name: 'Monthly',
      keyPrice: '10.0',
      expirationDuration: 5 * 60, // 5 minutes
    }
    return (
      <Lock
        account={accountWithBalance}
        lock={erc20Lock}
        transaction={null}
        lockKey={null}
        {...lockActions}
        openInNewWindow={false}
        keyStatus="none"
      />
    )
  })
  .add('with no key, ERC20 Lock, unknown currency', () => {
    const erc20Lock = {
      currencyContractAddress: '0x123ERC20',
      address: '0x123',
      name: 'Monthly',
      keyPrice: '66',
      expirationDuration: 5 * 60, // 5 minutes
    }
    return (
      <Lock
        account={accountWithBalance}
        lock={erc20Lock}
        transaction={null}
        lockKey={null}
        {...lockActions}
        openInNewWindow={false}
        keyStatus="none"
      />
    )
  })
  .add('with no key, for a short duration (check hover state too)', () => {
    const shortLock = {
      address: '0x123',
      name: 'Monthly',
      keyPrice: '0.23',
      expirationDuration: 5 * 60, // 5 minutes
    }
    return (
      <Lock
        account={accountWithBalance}
        lock={shortLock}
        transaction={null}
        lockKey={null}
        {...lockActions}
        openInNewWindow={false}
        keyStatus="none"
      />
    )
  })
  .add('with no key (check hover state too)', () => {
    return (
      <Lock
        account={accountWithBalance}
        lock={lock}
        transaction={null}
        lockKey={null}
        {...lockActions}
        openInNewWindow={false}
        keyStatus="none"
      />
    )
  })
  .add('with very long name', () => {
    return (
      <Lock
        account={accountWithBalance}
        lock={lockWithLongName}
        transaction={null}
        lockKey={null}
        {...lockActions}
        openInNewWindow={false}
        keyStatus="none"
      />
    )
  })
  .add('disabled - another lock has a pending key', () => {
    return (
      <Lock
        account={accountWithBalance}
        disabled
        lock={lock}
        transaction={null}
        lockKey={null}
        {...lockActions}
        openInNewWindow={false}
        keyStatus="none"
      />
    )
  })
  .add('disabled - no keys left to sell', () => {
    return (
      <Lock
        lock={soldOutLock}
        transaction={null}
        lockKey={null}
        {...lockActions}
        openInNewWindow={false}
        keyStatus="none"
      />
    )
  })
  .add('disabled - too expensive for current user in eth', () => {
    const accountWithNotEnoughEth = {
      balance: {
        eth: '0',
      },
      name: 'julien',
    }
    return (
      <Lock
        account={accountWithNotEnoughEth}
        lock={lock}
        transaction={null}
        lockKey={null}
        {...lockActions}
        openInNewWindow={false}
        keyStatus="none"
      />
    )
  })
  .add('disabled - too expensive for current user in erc20', () => {
    const erc20Lock = {
      currencyContractAddress: storyConfig.erc20Contract.address,
      address: '0x123',
      name: 'Monthly',
      keyPrice: '10.0',
      expirationDuration: 5 * 60, // 5 minutes
    }

    const accountWithNotEnoughErc20 = {
      balance: {
        [storyConfig.erc20Contract.address]: '0',
      },
      name: 'julien',
    }
    return (
      <Lock
        account={accountWithNotEnoughErc20}
        lock={erc20Lock}
        transaction={null}
        lockKey={null}
        {...lockActions}
        openInNewWindow={false}
        keyStatus="none"
      />
    )
  })
  .add(
    'not disabled - even if the price in eth is too expensive for current user',
    () => {
      const erc20Lock = {
        currencyContractAddress: storyConfig.erc20Contract.address,
        address: '0x123',
        name: 'Monthly',
        keyPrice: '66',
        expirationDuration: 5 * 60, // 5 minutes
      }
      const accountWithNotEnoughEth = {
        balance: {
          eth: '0',
          [storyConfig.erc20Contract.address]: '75',
        },
        name: 'julien',
      }
      return (
        <Lock
          account={accountWithNotEnoughEth}
          lock={erc20Lock}
          transaction={null}
          lockKey={null}
          {...lockActions}
          openInNewWindow={false}
          keyStatus="none"
        />
      )
    }
  )
  .add('with a pending key (not yet mined)', () => {
    const k = {
      lock: lock.address,
    }
    const t = {
      status: 'submitted',
    }
    return (
      <Lock
        lock={lock}
        transaction={t}
        lockKey={k}
        config={config}
        {...lockActions}
        openInNewWindow={false}
        keyStatus="submitted"
      />
    )
  })
  .add('with a pending key (not yet mined) for an know ERC20 Lock', () => {
    const erc20Lock = {
      currencyContractAddress: storyConfig.erc20Contract.address,
      address: '0x123',
      name: 'Monthly',
      keyPrice: '66',
      expirationDuration: 5 * 60, // 5 minutes
    }
    const k = {
      lock: erc20Lock.address,
    }
    const t = {
      status: 'submitted',
    }
    return (
      <Lock
        lock={erc20Lock}
        transaction={t}
        lockKey={k}
        {...lockActions}
        openInNewWindow={false}
        keyStatus="submitted"
      />
    )
  })
  .add('with a mined key (which was not confirmed).', () => {
    const k = {
      lock: lock.address,
    }
    const t = {
      status: 'mined',
      confirmations: config.requiredConfirmations - 1,
    }
    return (
      <Lock
        lock={lock}
        transaction={t}
        lockKey={k}
        config={config}
        {...lockActions}
        openInNewWindow={false}
        keyStatus="confirming"
      />
    )
  })
  .add(
    'with a mined key which was not confirmed for an know ERC20 Lock',
    () => {
      const erc20Lock = {
        currencyContractAddress: storyConfig.erc20Contract.address,
        address: '0x123',
        name: 'Monthly',
        keyPrice: '66',
        expirationDuration: 5 * 60, // 5 minutes
      }
      const k = {
        lock: erc20Lock.address,
      }
      const t = {
        status: 'mined',
        confirmations: config.requiredConfirmations - 1,
      }
      return (
        <Lock
          lock={erc20Lock}
          transaction={t}
          lockKey={k}
          {...lockActions}
          openInNewWindow={false}
          keyStatus="confirming"
        />
      )
    }
  )
  .add('with a mined key.', () => {
    const k = {
      lock: lock.address,
    }
    const t = {
      status: 'mined',
      confirmations: config.requiredConfirmations + 1,
    }

    const lockWithKey = {
      ...lock,
      key: {},
    }
    return (
      <Lock
        lock={lockWithKey}
        transaction={t}
        lockKey={k}
        config={config}
        {...lockActions}
        openInNewWindow={false}
        keyStatus="valid"
      />
    )
  })

  .add('with a mined key for an know ERC20 Lock', () => {
    const erc20Lock = {
      currencyContractAddress: storyConfig.erc20Contract.address,
      address: '0x123',
      name: 'Monthly',
      keyPrice: '66',
      expirationDuration: 5 * 60, // 5 minutes
      key: {},
    }
    const k = {
      lock: erc20Lock.address,
    }
    const t = {
      status: 'mined',
      confirmations: config.requiredConfirmations + 1,
    }
    return (
      <Lock
        lock={erc20Lock}
        transaction={t}
        lockKey={k}
        {...lockActions}
        openInNewWindow={false}
        keyStatus="valid"
      />
    )
  })
  .add('with a balance', () => {
    const lockWithBalance = {
      address: '0x123',
      name: 'Monthly',
      keyPrice: '0.23',
      expirationDuration: 2592000,
      balance: '5',
    }
    return (
      <Lock
        account={accountWithBalance}
        lock={lockWithBalance}
        transaction={null}
        lockKey={null}
        config={config}
        {...lockActions}
        openInNewWindow={false}
        keyStatus="none"
      />
    )
  })
  .add('with an unlinited number of keys', () => {
    const lockWithInfiniteNumberOfKeys = {
      maxNumberOfKeys: UNLIMITED_KEYS_COUNT,
      outstandingKeys: 4,
      ...lock,
    }
    return (
      <Lock
        account={accountWithBalance}
        lock={lockWithInfiniteNumberOfKeys}
        transaction={null}
        lockKey={null}
        config={config}
        {...lockActions}
        openInNewWindow={false}
        keyStatus="none"
      />
    )
  })

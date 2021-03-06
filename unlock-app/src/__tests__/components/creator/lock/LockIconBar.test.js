import React from 'react'
import * as rtl from '@testing-library/react'
import { TransactionType } from '../../../../unlockTypes'

import { LockIconBar } from '../../../../components/creator/lock/LockIconBar'

describe('LockIconBar', () => {
  let lock
  let store
  let toggleCode

  beforeEach(() => {
    lock = {
      id: 'lock',
      keyPrice: '10000000000000000000',
      expirationDuration: 172800,
      maxNumberOfKeys: 240,
      outstandingKeys: 3,
      address: '0xbc7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
    }
    toggleCode = jest.fn()
  })

  it('should trigger edit when clicked', () => {
    expect.assertions(2)
    const edit = jest.fn()

    const config = {
      requiredConfirmations: 10,
      chainExplorerUrlBuilders: {
        etherscan: (path) => path,
      },
    }
    const wrapper = rtl.render(
      <LockIconBar
        lock={lock}
        toggleCode={toggleCode}
        config={config}
        edit={edit}
      />
    )

    rtl.fireEvent.click(wrapper.getByTitle('Edit'))

    expect(edit).toHaveBeenCalledTimes(1)
    expect(edit).toHaveBeenCalledWith(lock.address)
  })
})

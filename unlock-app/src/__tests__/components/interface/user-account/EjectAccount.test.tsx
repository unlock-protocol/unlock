import React from 'react'
import * as rtl from '@testing-library/react'
import {
  EjectAccount,
  EjectionForm,
} from '../../../../components/interface/user-account/EjectAccount'
import { EncryptedPrivateKey } from '../../../../unlockTypes'
import { vi } from 'vitest'
import { describe, it, expect } from 'vitest'
const passwordEncryptedPrivateKey: EncryptedPrivateKey = {
  address: '51eb293d64dd50182a087583bf5c94455b323a83',
  id: '0bace22e-28c9-4e58-a89f-2fd85ca3dcaf',
  version: 3,
  Crypto: {
    cipher: 'aes-128-ctr',
    cipherparams: {
      iv: '1e0f548a4246a2b42efd9e5a05952eb9',
    },
    ciphertext:
      'e9f255789dea348c987f6b2b2f2504da3e956560379d7615ab1d85815dbd6021',
    kdf: 'scrypt',
    kdfparams: {
      salt: '8bd0cc6c24d0d3372ffdf60006a9bac51a2c943b4a57a253398571f50d0b8715',
      n: 8192,
      dklen: 32,
      p: 1,
      r: 8,
    },
    mac: '6784fc481e7998b6794b202f83bf446b63caf0dc1facab127ac55ae6e9f2120e',
  },
  'x-ethers': {
    client: 'ethers.js',
    gethFilename:
      'UTC--2019-10-17T17-57-17.0Z--51eb293d64dd50182a087583bf5c94455b323a83',
    mnemonicCounter: '7952a710ed700164ac58f5145eb9e502',
    mnemonicCiphertext: '35396c7400c54b026f1080fe78e9915a',
    path: "m/44'/60'/0'/0/0",
    version: '0.1',
  },
}

describe('EjectAccount component', () => {
  describe.skip('EjectAccount', () => {
    it('Should render the parent component, including the form', () => {
      const { getByText } = rtl.render(<EjectAccount />)

      // Section header
      getByText('Export Account')
      // Checkbox label in form
      getByText('Yes, I want to export and delete my account')
    })
  })

  describe('EjectionForm', () => {
    it('should prevent ejection unless the checkbox is checked', () => {
      expect.assertions(1)
      const download = vi.fn()
      const { getByText } = rtl.render(
        <EjectionForm
          download={download}
          encryptedPrivateKey={passwordEncryptedPrivateKey}
        />
      )
      const ejectButton = getByText('Eject')
      rtl.fireEvent.click(ejectButton)
      expect(download).not.toHaveBeenCalled()
    })

    it('should allow ejection when the checkbox is checked', () => {
      expect.assertions(1)
      const download = vi.fn()
      const { getByText, container } = rtl.render(
        <EjectionForm
          download={download}
          encryptedPrivateKey={passwordEncryptedPrivateKey}
        />
      )
      const checkbox = container.querySelector(
        '#ejection-confirmation-checkbox'
      )
      if (checkbox) {
        rtl.fireEvent.click(checkbox)
      }
      const ejectButton = getByText('Eject')
      rtl.fireEvent.click(ejectButton)
      expect(download).toHaveBeenCalledWith(
        passwordEncryptedPrivateKey,
        'encrypted-private-key.json'
      )
    })
  })
})

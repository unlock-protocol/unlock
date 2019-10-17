import {
  mapStateToProps,
  isOnAppPage,
} from '../../../components/interface/Header'
import { createUnlockStore } from '../../../createUnlockStore'

const router = {
  location: {
    pathname: '/',
    search: '',
    hash: '',
  },
}

const cryptoAccount = {
  address: '0x123abc',
  balance: '0',
}

const managedAccount = {
  address: '0xabc123',
  emailAddress: 'hungrybear@dark.cave',
  balance: '0',
}

const cryptoStore = createUnlockStore({ router, account: cryptoAccount })
const managedStore = createUnlockStore({ router, account: managedAccount })

describe('mapStateToProps', () => {
  it('should return the pathname from the router as a prop', () => {
    expect.assertions(1)
    const state = cryptoStore.getState()
    const props = mapStateToProps(state)
    expect(props).toHaveProperty('pathname', '/')
  })

  it('should return account/crypto when the current account is a crypto user', () => {
    expect.assertions(1)
    const state = cryptoStore.getState()
    const props = mapStateToProps(state)
    expect(props).toHaveProperty('accountType', 'account/crypto')
  })

  it('should return account/managed when the current account is a managed user', () => {
    expect.assertions(1)
    const state = managedStore.getState()
    const props = mapStateToProps(state)
    expect(props).toHaveProperty('accountType', 'account/managed')
  })

  it('should return account/undefined if there is no account', () => {
    expect.assertions(1)
    const state = { router }
    const props = mapStateToProps(state)
    expect(props).toHaveProperty('accountType', 'account/undefined')
  })

  it('should return a diagnostic if the account is otherwise invalid', () => {
    expect.assertions(1)
    const state = { router, account: {} }
    const props = mapStateToProps(state)
    expect(props).toHaveProperty(
      'accountType',
      'account/address={undefined}--emailAddress={undefined}'
    )
  })
})

describe('isOnAppPage', () => {
  it('should return false if no app button matches the current pathname', () => {
    expect.assertions(1)
    expect(isOnAppPage('/about')).toEqual(false)
  })

  it('should return the pathnam if an app button equals the current pathname', () => {
    expect.assertions(1)
    expect(isOnAppPage('/dashboard')).toEqual('/dashboard')
  })

  it('should return the pathnam if an app button matches the current pathname', () => {
    expect.assertions(1)
    expect(isOnAppPage('/dashboard/')).toEqual('/dashboard')
  })
})

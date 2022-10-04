import { isOnAppPage } from '../../../components/interface/Header'

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

describe('isOnAppPage', () => {
  it('should return false if no app button matches the current pathname', () => {
    expect.assertions(1)
    expect(isOnAppPage('/about')).toEqual(false)
  })

  it('should return the pathnam if an app button equals the current pathname', () => {
    expect.assertions(1)
    expect(isOnAppPage('/locks')).toEqual('/locks')
  })

  it('should return the pathnam if an app button matches the current pathname', () => {
    expect.assertions(1)
    expect(isOnAppPage('/locks/')).toEqual('/locks')
  })
})

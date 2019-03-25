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

const store = createUnlockStore({ router })

describe('mapStateToProps', () => {
  it('should return the pathname from the router as a prop', () => {
    expect.assertions(1)
    const state = store.getState()
    const props = mapStateToProps(state)
    expect(props).toHaveProperty('pathname', '/')
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

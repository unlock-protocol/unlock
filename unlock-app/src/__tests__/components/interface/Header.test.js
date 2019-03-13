import { mapStateToProps } from '../../../components/interface/Header'
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

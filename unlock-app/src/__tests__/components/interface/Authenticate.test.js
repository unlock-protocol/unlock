import { mapStateToProps } from '../../../components/interface/Authenticate'

const account = {
  address: '0xaddress',
}

const network = {
  name: '4',
}

describe('mapStateToProps', () => {
  it('should return the account and network', () => {
    expect.assertions(1)
    const somethingElse = 'something else'
    const props = mapStateToProps({
      account,
      network,
      somethingElse,
    })
    expect(props).toEqual({
      account,
      network,
    })
  })
})

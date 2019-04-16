import { mapStateToProps } from '../../../components/content/CreateContent'

const inputLocks = {
  abc123: { address: 'abc123' },
  def459: { address: 'def456' },
}

describe('mapStateToProps', () => {
  it('should return an array of locks when given a redux lock object', () => {
    expect.assertions(4)
    const props = mapStateToProps({ locks: inputLocks })

    expect(props.locks.length).toEqual(2)
    expect(props.locks[0]).toEqual('abc123')
    expect(props.locks[1]).toEqual('def456')
    expect(props.now).toBeInstanceOf(Date)
  })
})

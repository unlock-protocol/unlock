import React from 'react'
import { shallow } from 'enzyme'
// Note, we use name import to import the non connected version of the component for testing
import { Duration } from '../../../components/helpers/Duration'

describe('Duration Component', () => {

  const seconds = '10000000'

  const wrapper = shallow(<Duration seconds={seconds} />)

  it('shows the duration in seconds', () => {
    expect(wrapper.text()).toEqual('115 days, 17 hours, 46 minutes and 40 seconds')
  })

})
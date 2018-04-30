import React from 'react'
import { shallow } from 'enzyme'
// Note, we use name import to import the non connected version of the component for testing
import { Home } from '../../components/Home'

describe('Home Component', () => {

  const component = (<Home />)
  const wrapper = shallow(component)

  it('shows the button to the creators interface', () => {
    const button = wrapper.find('Link')
    expect(button).toHaveLength(1)
    expect(button.at(0).prop('to')).toEqual('/creator')
  })

})

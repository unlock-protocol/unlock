import React from 'react'
import { shallow } from 'enzyme'
// Note, we use name import to import the non connected version of the component for testing
import { Unlock } from '../../components/Unlock'

describe('Unlock Component', () => {

  it('shows the account picker component', () => {
    const unlock = shallow(<Unlock />)
    expect(unlock.find('Navbar')).toHaveLength(1)
    const navbar = unlock.find('Navbar')
    expect(navbar.find('Nav')).toHaveLength(1)
    const nav = navbar.find('Nav')
    expect(nav.find('Connect(Account)')).toHaveLength(1)
  })

  // TODO: find a way to test routes?
  it('shows the creators interface if the route matches /creator')

  // TODO: find a way to test routes?
  it('shows the lock consumer interface if the route matches /lock/:lockAddress')

})
import React from 'react'
import renderer from 'react-test-renderer'
import { withConfig } from '../../../utils/withConfig'

const Component = () => <div>An unlock component</div>

const ComponentWithConfig = withConfig(Component)

describe('withConfig High Order Component', () => {
  it('should render correctly', () => {
    expect.assertions(1)
    const tree = renderer
      .create(<ComponentWithConfig router={{ route: '/provider' }} />)
      .toJSON()
    expect(tree).toMatchSnapshot()
  })
})

import initStoryshots from '@storybook/addon-storyshots'
import 'jest-styled-components'
import renderer from 'react-test-renderer'

// Using this function means we'll see the change in the css in the snapshot
// diff instead of just the change in classname
const styledSnapshot = ({ story, context }) => {
  const storyElement = story.render(context)
  const tree = renderer.create(storyElement).toJSON()
  expect(tree).toMatchSnapshot()
}

initStoryshots({
  test: styledSnapshot,
})

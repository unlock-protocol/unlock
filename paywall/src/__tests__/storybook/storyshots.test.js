import registerRequireContextHook from 'babel-plugin-require-context-hook/register'
import initStoryshots, {
  Stories2SnapsConverter,
} from '@storybook/addon-storyshots'
import * as renderer from 'react-test-renderer'

import 'jest-styled-components'
import { styleSheetSerializer } from 'jest-styled-components/serializer'
import { addSerializer } from 'jest-specific-snapshot'

addSerializer(styleSheetSerializer)

registerRequireContextHook()

initStoryshots({
  renderer,
  test: ({ story, context }) => {
    const converter = new Stories2SnapsConverter()
    const snapshotFilename = converter.getSnapshotFileName(context)

    /* eslint-disable no-console */
    const { error } = console

    try {
      console.error = jest.fn(console.error)
      const storyElement = story.render(context)
      const tree = renderer.create(storyElement).toJSON()
      expect(tree).toMatchSpecificSnapshot(snapshotFilename)
      // snapshotWithOptions({ renderer })(info)
      expect(console.error).not.toHaveBeenCalled()
    } finally {
      console.error = error
    }
    /* eslint-enable no-console */
  },
})

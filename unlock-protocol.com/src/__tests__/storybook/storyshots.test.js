import initStoryshots, {
  snapshotWithOptions,
} from '@storybook/addon-storyshots'
import { render as renderer } from '@testing-library/react'

initStoryshots({
  renderer,
  test: (info) => {
    /* eslint-disable no-console */

    const { error } = console

    try {
      console.error = jest.fn(console.error)
      snapshotWithOptions({ renderer })(info)
      expect(console.error).not.toHaveBeenCalled()
    } finally {
      console.error = error
    }
    /* eslint-enable no-console */
  },
})

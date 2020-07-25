import initStoryshots, {
  snapshotWithOptions,
} from '@storybook/addon-storyshots'
import { render as renderer } from '@testing-library/react'

initStoryshots({
  renderer,
  test: (info) => {
    /* eslint-disable no-console */

    const { error } = console
    const { warn } = console

    try {
      console.error = jest.fn(console.error)
      console.warn = jest.fn(console.warn)
      snapshotWithOptions({ renderer })(info)
      expect(console.error).not.toHaveBeenCalled()
      expect(console.warn).not.toHaveBeenCalled()
    } finally {
      console.warn = warn
      console.error = error
    }
    /* eslint-enable no-console */
  },
})

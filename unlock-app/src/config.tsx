import { config } from './config/app'

// @ts-expect-error - unused variable. TODO: Remove this.
export default function configure(options?: any) {
  return config
}

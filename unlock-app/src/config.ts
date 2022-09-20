import { config } from './config/app'

// @ts-expect-error - unused variable. Remove this.
export default function configure(options?: any) {
  return config
}

import { useCallback, useRef } from 'react'
import { config } from '~/config/app'

export const useCaptcha = () => {
  const recaptchaRef = useRef<any>()

  const getCaptchaValue = useCallback(async () => {
    if (config?.env === 'dev') {
      return 'dev-captcha'
    } else {
      await recaptchaRef.current?.reset()
      return await recaptchaRef.current?.executeAsync()
    }
  }, [recaptchaRef])

  return { recaptchaRef, getCaptchaValue }
}

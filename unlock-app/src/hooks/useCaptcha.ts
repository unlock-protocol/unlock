import { useCallback, useRef } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import { config } from '~/config/app'

export const useCaptcha = () => {
  const recaptchaRef = useRef<ReCAPTCHA>(null)

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

export function generateVerificationCode() {
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expiration = new Date(Date.now() + 10 * 60 * 1000) // Expires in 10 minutes

  return { code, expiration }
}

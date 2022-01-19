export const config = {
  id: process.env.WEBHOOK_ID!,
  token: process.env.WEBHOOK_TOKEN!,
  signKey: process.env.SIGN_KEY || 'test',
}

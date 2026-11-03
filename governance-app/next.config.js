/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires */
const dotenv = require('dotenv')
const path = require('path')

const unlockEnv = process.env.NEXT_PUBLIC_UNLOCK_ENV || 'dev'

dotenv.config({
  path: path.resolve(__dirname, '..', `.env.${unlockEnv}.local`),
})

/** @type {import('next').NextConfig} */
const config = {
  images: {
    unoptimized: true,
  },
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../'),
  },
}

module.exports = config

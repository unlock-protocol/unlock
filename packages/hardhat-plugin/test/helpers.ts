/* eslint-disable prefer-arrow-callback, func-names */
import { resetHardhatContext } from 'hardhat/plugins-testing'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { assert } from 'chai'

import path from 'path'

import '../src/type-extensions'

declare module 'mocha' {
  interface Context {
    hre: HardhatRuntimeEnvironment
  }
}

/**
 * Takes in a function and checks for error
 * @param {Function} method - The function to check
 * @param {any[]} params - The array of function parameters
 * @param {string} message - Optional message to match with error message
 */
export const expectThrowsAsync = async (
  method: Function,
  params: any[],
  message?: string
) => {
  let err: unknown | Error
  try {
    await method(...params)
  } catch (error) {
    err = error
  }
  if (err && err instanceof Error) {
    assert.equal(err.message, message)
  } else {
    assert.equal(typeof err, 'Error')
  }
}

export function useEnvironment(fixtureProjectName: string) {
  beforeEach(function () {
    process.chdir(path.join(__dirname, 'fixture-projects', fixtureProjectName))
    // eslint-disable-next-line global-require
    this.hre = require('hardhat')
  })

  afterEach(function () {
    resetHardhatContext()
  })
}

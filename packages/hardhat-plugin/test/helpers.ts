import { resetHardhatContext } from 'hardhat/plugins-testing'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import path from 'path'

declare module 'mocha' {
  interface Context {
    hre: HardhatRuntimeEnvironment
  }
}

export function useEnvironment(fixtureProjectName: string) {
  beforeEach(function () {
    process.chdir(path.join(__dirname, 'fixture-projects', fixtureProjectName))
    // eslint-disable-next-line global-require
    this.hre = require('hardhat')
  })

  afterEach('Resetting hardhat', () => {
    resetHardhatContext()
  })
}

const { ethers, upgrades } = require('hardhat')
const { getDeployment } = require('../../helpers/deployments')

const ZERO_ADDRESS = web3.utils.padLeft(0, 40)
// const TIMELOCK_ADMIN_ROLE = '0x5f58e3a2316349923ce3780f8d587db2d72378aed66a8261c916544fa6846ca5'
// const PROPOSER_ROLE = '0xb09aa5aeb3702cfd50b6b62bc4532604938f21248a27a1d5ca736082b6819cc1'

contract('UnlockProtocolGovernor', () => {
  let gov

  beforeEach(async () => {
    // deploying timelock with a proxy
    const UnlockProtocolTimelock = await ethers.getContractFactory(
      'UnlockProtocolTimelock'
    )

    const timelock = await upgrades.deployProxy(UnlockProtocolTimelock, [
      1, // 1 second delay
      [], // proposers list is empty at deployment
      [ZERO_ADDRESS], // allow any address to execute a proposal once the timelock has expired
    ])
    await timelock.deployed()

    const UDTInfo = await getDeployment(31337, 'UnlockDiscountToken')
    const tokenAddress = UDTInfo.address

    // deploy governor
    const UnlockProtocolGovernor = await ethers.getContractFactory(
      'UnlockProtocolGovernor'
    )

    gov = await upgrades.deployProxy(UnlockProtocolGovernor, [
      tokenAddress,
      timelock.address,
    ])
    await gov.deployed()
  })

  describe('Default values', () => {
    it('default duration is 1 block', async () => {
      assert.equal(await gov.votingDelay(), 1)
    })

    it('voting period is 1 week', async () => {
      assert.equal(await gov.votingPeriod(), 45818)
    })

    it('quorum is 15k UDT', async () => {
      assert.equal(await gov.quorum(1), 15000e18)
    })
  })
})

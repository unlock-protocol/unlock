// testing Bridge using a MockBridge contract
const { ZERO_ADDRESS } = require("@openzeppelin/test-helpers/src/constants");
const { assert } = require("chai");
const { ethers } = require("hardhat");

const {
  deployContracts,
  reverts,
  ADDRESS_ZERO,
  deployBridge,
  getProxyAdmin,
} = require("../helpers");

let bridge,
  daoTimelock,
  multisig,
  multisig2,
  unlock,
  unlockOwner,
  proxyAdmin

//
const destChainId = 31337;
const destDomainId = 1734439522;

const gasEstimate = 16000;
const url = `http://locksmith:8080/api/key/`;


const deployPublicLockImpl = async () => {
  const PublicLock = await ethers.getContractFactory('TestPublicLockUpgraded')

  // deploy template
  const template = await PublicLock.deploy()
  const args = [
    template.address,
    14
  ]

  // parse call
  const { interface } = unlock
  const unlockCallData =  interface.encodeFunctionData('addLockTemplate', args)
  const calldata = ethers.utils.defaultAbiCoder.encode(['uint8', 'bytes' ], [1, unlockCallData])

  return {
    args,
    calldata,
    template
  }
}


const deployUnlockImpl = async () => {
  const UnlockUpgraded = await ethers.getContractFactory('TestUnlockUpgraded')
  const unlockUpgraded = await UnlockUpgraded.deploy()

  const { interface } = proxyAdmin
  const args = [unlock.address, unlockUpgraded.address]
  const proxyAdminCalldata = interface.encodeFunctionData('upgrade', args)
  const calldata = ethers.utils.defaultAbiCoder.encode(['uint8', 'bytes' ], [2, proxyAdminCalldata])

  return {
    calldata, unlockUpgraded
  }
}

contract("Unlock / bridged governance", () => {
  before(async () => {
    
    ;[, daoTimelock, multisig, multisig2] = await ethers.getSigners()

    // mock bridge
    ;({bridge} = await deployBridge())

    // deploy and set Unlock on a remote chain
    ;({ unlockEthers: unlock } = await deployContracts());
    await unlock.configUnlock(
      ADDRESS_ZERO, // udt
      ADDRESS_ZERO, // wrappedEth
      gasEstimate,
      "DEST_KEY",
      url,
      destChainId
    );

    // deploy unlock manager on remote chain
    const UnlockOwner = await ethers.getContractFactory("UnlockOwner");
    const { chainId } = await ethers.provider.getNetwork()

    unlockOwner = await UnlockOwner.deploy(
      bridge.address,
      unlock.address,
      daoTimelock.address, // dao address on mainnet
      multisig.address,
      destDomainId,
      chainId
    );
    
    // transfer assets to unlockOwner on dest chain
    proxyAdmin = await getProxyAdmin(unlock.address)
    await proxyAdmin.transferOwnership(unlockOwner.address)
    await unlock.transferOwnership(unlockOwner.address)
  });

  describe("constructor", () => {
    it("stores bridge address", async () => {
      assert.equal(bridge.address, await unlockOwner.bridgeAddress());
    });

    it("stores Unlock address properly", async () => {
      assert.equal(
        await unlockOwner.unlockAddress(),
        unlock.address
      );
    });

    it("stores the domain properly", async () => {
      assert.equal(await unlockOwner.domain(), destDomainId);
    });

    it("stores DAO address", async () => {
      assert.equal(daoTimelock.address, await unlockOwner.daoTimelockAddress());
    });
    
    it("stores multisig address", async () => {
      assert.equal(daoTimelock.address, await unlockOwner.daoTimelockAddress());
    });
    
    it("stores mainnet chainId", async () => {
      const { chainId } = await ethers.provider.getNetwork()
      assert.equal(await unlockOwner.mainnetChainId(), chainId);
    });
  });

  describe("change Unlock settings", () => {
    let calldata, args, template
    beforeEach( async () => {
      ({calldata, args, template} = await deployPublicLockImpl())
    })

    it('DAO through the bridge', async () => {
      // make sure settings were ok before
      assert.equal(await unlock.publicLockImpls(args[1]), ADDRESS_ZERO);
      assert.equal(await unlock.publicLockVersions(args[0]), 0);

      // send through the DAO > mainnet manager > bridge path
      await bridge.connect(daoTimelock).xcall(
        destChainId,
        unlockOwner.address,
        ZERO_ADDRESS, // asset
        ZERO_ADDRESS, // delegate
        0, // amount
        30, // slippage
        calldata,
      )

      // make sure things have worked correctly
      assert.equal(await unlock.publicLockVersions(args[0]), args[1]);
      assert.equal(await unlock.publicLockImpls(args[1]), args[0]);
    })

    it('DAO without bridge', async () => {
      assert.notEqual(await unlock.publicLockImpls(args[1]), template.address);
      await unlockOwner.connect(daoTimelock).execDAO(calldata)
      assert.equal(await unlock.publicLockImpls(args[1]), template.address);
    })

    it('via multisig', async () => {
      // make sure settings were ok before
      assert.notEqual(await unlock.publicLockImpls(args[1]), template.address);
      assert.equal(await unlock.publicLockVersions(args[0]), 0);

      // send through the DAO > mainnet manager > bridge path
      await unlockOwner.connect(multisig).execMultisig(
        calldata
      )

      // make sure things have worked correctly
      assert.equal(await unlock.publicLockVersions(args[0]), args[1]);
      assert.equal(await unlock.publicLockImpls(args[1]), args[0]);
    })
  })


  describe("update proxied contract via proxyAdmin", () => { 
    let calldata, unlockUpgraded
    beforeEach(async () => {
      ;({calldata, unlockUpgraded} = await deployUnlockImpl())
    })   
    it('DAO from the bridge', async () => {
      // send through the dispatcher
      await bridge.connect(daoTimelock).xcall(
        destChainId,
        unlockOwner.address,
        ZERO_ADDRESS,
        ZERO_ADDRESS,
        0,
        30,
        calldata
      )

      const unlockAfterUpgrade = await ethers.getContractAt('TestUnlockUpgraded', unlock.address)
      assert.equal(await unlockAfterUpgrade.getImplAddress(), unlockUpgraded.address)
    })

    it('DAO directly from mainnet', async ()=> {
      await unlockOwner.connect(daoTimelock).execDAO(
        calldata
      )

      const unlockAfterUpgrade = await ethers.getContractAt('TestUnlockUpgraded', unlock.address)
      assert.equal(await unlockAfterUpgrade.getImplAddress(), unlockUpgraded.address)
    })

    it('via multisig', async () => {
      // send through the DAO > mainnet manager > bridge path
      await unlockOwner.connect(multisig).execMultisig(
        calldata
      )

      const unlockAfterUpgrade = await ethers.getContractAt('TestUnlockUpgraded', unlock.address)
      assert.equal(await unlockAfterUpgrade.getImplAddress(), unlockUpgraded.address)
    })
  })

  describe("changeMultisig", () => {
    it('can only be called by the multisig itself', async () => {
      await reverts(
        unlockOwner.changeMultisig(ADDRESS_ZERO),
        'Unauthorized'
      )
    })

    it('allow the multisig to replace itself', async () => {
      await unlockOwner.connect(multisig).changeMultisig(multisig2.address)
      assert.equal(
        await unlockOwner.multisigAddress(),
        multisig2.address
      )
    })

    it('allow the multisig to remove itself', async () => {
      await unlockOwner.connect(multisig2).changeMultisig(ADDRESS_ZERO)
      assert.equal(
        await unlockOwner.multisigAddress(),
        ADDRESS_ZERO
      )

      // make sure exec reverts
      const calldata = ethers.utils.defaultAbiCoder.encode(['uint8', 'bytes' ], [2, '0x'])
      await reverts(
        unlockOwner.connect(multisig2).execMultisig(calldata),
        'Unauthorized'
      )
    })
  })

  describe("reverts", () => {
    let calldata 
    before( async () => {
      ;({calldata} = await deployPublicLockImpl())
    })

    it('reverts is xReceive has not been called through the bridge', async () => {
      await reverts(
        unlockOwner.xReceive(
          ethers.utils.formatBytes32String("test"), // transferId
          0, // amount
          ADDRESS_ZERO, //currency
          daoTimelock.address, // caller on origin chain
          destDomainId,
          calldata,
        ),
        'Unauthorized'
      )
    })

    it('reverts is xcall has not been called by the DAO', async () => {
      await reverts(
        bridge.xcall(
          destChainId,
          unlockOwner.address,
          ZERO_ADDRESS,
          ZERO_ADDRESS,
          0,
          30,
          calldata,
        ),
        'Unauthorized'
      )
    })
    
    it('reverts if execMultisig is not called by multisig', async () => {
      await reverts(
        unlockOwner.execMultisig(calldata),
        'Unauthorized'
      )
    })
    
    it('reverts if execDAO is not called by DAO itself', async () => {
      await reverts(
        unlockOwner.execDAO(calldata),
        'Unauthorized'
      )
    })
  })

});

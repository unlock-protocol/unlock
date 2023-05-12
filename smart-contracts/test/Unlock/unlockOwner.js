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
  dao,
  multisig,
  managerDest,
  unlockDest,
  wethDest,
  proxyAdmin

//
const destChainId = 31337;
const destDomainId = 1734439522;

const gasEstimate = 16000;
const url = `http://locksmith:8080/api/key/`;

contract("Unlock / bridged governance", () => {
  before(async () => {
    
    ;[, dao, multisig] = await ethers.getSigners()

    // mock bridge
    ;({bridge, wethDest} = await deployBridge())

    // deploy and set Unlock on a remote chain
    ;({ unlockEthers: unlockDest } = await deployContracts());
    await unlockDest.configUnlock(
      ADDRESS_ZERO, // udt
      wethDest.address, // wrappedEth
      gasEstimate,
      "DEST_KEY",
      url,
      destChainId
    );

    // deploy unlock manager on remote chain
    const UnlockOwner = await ethers.getContractFactory("UnlockOwner");
        
    managerDest = await UnlockOwner.deploy(
      bridge.address,
      unlockDest.address,
      dao.address, // dao address on mainnet
      multisig.address,
      destDomainId,
    );
    
    // transfer assets to unlockOwner on dest chain
    proxyAdmin = await getProxyAdmin(unlockDest.address)
    await proxyAdmin.transferOwnership(managerDest.address)
    await unlockDest.transferOwnership(managerDest.address)
  });

  describe("constructor", () => {
    it("stores bridge address", async () => {
      assert.equal(bridge.address, await managerDest.bridgeAddress());
    });

    it("stores Unlock address properly", async () => {
      assert.equal(
        await managerDest.unlockAddress(),
        unlockDest.address
      );
    });

    it("stores the domain properly", async () => {
      assert.equal(await managerDest.domain(), destDomainId);
    });

    it("stores DAO address", async () => {
      assert.equal(dao.address, await managerDest.daoAddress());
    });
    
    it("stores multisig address", async () => {
      assert.equal(dao.address, await managerDest.daoAddress());
    });
  });

  describe("change Unlock settings", () => {
    let calldata, args, PublicLock
    before( async () => {
      PublicLock = await ethers.getContractFactory('TestPublicLockUpgraded')

      // deploy template
      const template = await PublicLock.deploy()
      args = [
        template.address,
        14
      ]

      // parse call
      const { interface } = unlockDest
      const unlockCallData =  interface.encodeFunctionData('addLockTemplate', args)
      calldata = ethers.utils.defaultAbiCoder.encode(['uint8', 'bytes' ], [1, unlockCallData])
    })

    it('DAO through the bridge', async () => {
      // make sure settings were ok before
      assert.equal(await unlockDest.publicLockImpls(args[1]), ADDRESS_ZERO);
      assert.equal(await unlockDest.publicLockVersions(args[0]), 0);

      // send through the DAO > mainnet manager > bridge path
      await bridge.connect(dao).xcall(
        destChainId,
        managerDest.address,
        ZERO_ADDRESS, // asset
        ZERO_ADDRESS, // delegate
        0, // amount
        30, // slippage
        calldata,
      )

      // make sure things have worked correctly
      assert.equal(await unlockDest.publicLockVersions(args[0]), args[1]);
      assert.equal(await unlockDest.publicLockImpls(args[1]), args[0]);
    })
    it('via multisig', async () => {
      const template = await PublicLock.deploy()
      const args = [
        template.address,
        15
      ]

      // parse call
      const { interface } = unlockDest
      const unlockCallData =  interface.encodeFunctionData('addLockTemplate', args)
      const calldata = ethers.utils.defaultAbiCoder.encode(['uint8', 'bytes' ], [1, unlockCallData])

      // make sure settings were ok before
      assert.equal(await unlockDest.publicLockImpls(args[1] + 1), ADDRESS_ZERO);
      assert.equal(await unlockDest.publicLockVersions(args[0]), 0);

      // send through the DAO > mainnet manager > bridge path
      await managerDest.connect(multisig).execMultisig(
        calldata
      )

      // make sure things have worked correctly
      assert.equal(await unlockDest.publicLockVersions(args[0]), args[1]);
      assert.equal(await unlockDest.publicLockImpls(args[1]), args[0]);
    })

    it('reverts is xcall has not been called by the DAO', async () => {
      await reverts(
        bridge.xcall(
          destChainId,
          managerDest.address,
          ZERO_ADDRESS,
          ZERO_ADDRESS,
          0,
          30,
          calldata,
        ),
        'Unauthorized'
      )
    })
    
    it('reverts if exec is not called by multisig', async () => {
      await reverts(
        managerDest.execMultisig(calldata),
        'Unauthorized'
      )
    })
  })


  describe("update proxied contract via proxyAdmin", () => {    
    it('DAO from the bridge', async () => {
      const UnlockUpgraded = await ethers.getContractFactory('TestUnlockUpgraded')
      const unlockUpgraded = await UnlockUpgraded.deploy()

      const { interface } = proxyAdmin
      const args = [unlockDest.address, unlockUpgraded.address]
      const proxyAdminCalldata = interface.encodeFunctionData('upgrade', args)
      const calldata = ethers.utils.defaultAbiCoder.encode(['uint8', 'bytes' ], [2, proxyAdminCalldata])

      // send through the dispatcher
      await bridge.connect(dao).xcall(
        destChainId,
        managerDest.address,
        ZERO_ADDRESS,
        ZERO_ADDRESS,
        0,
        30,
        calldata
      )

      const unlockAfterUpgrade = await ethers.getContractAt('TestUnlockUpgraded', unlockDest.address)
      assert.equal(await unlockAfterUpgrade.sayHello(), 'hello world')
    })
    it('via multisig', async () => {
      const UnlockUpgraded = await ethers.getContractFactory('TestUnlockUpgraded')
      const unlockUpgraded = await UnlockUpgraded.deploy()

      const { interface } = proxyAdmin
      const args = [unlockDest.address, unlockUpgraded.address]
      const proxyAdminCalldata = interface.encodeFunctionData('upgrade', args)
      const calldata = ethers.utils.defaultAbiCoder.encode(['uint8', 'bytes' ], [2, proxyAdminCalldata])

      // send through the DAO > mainnet manager > bridge path
      await managerDest.connect(multisig).execMultisig(
        calldata
      )

      const unlockAfterUpgrade = await ethers.getContractAt('TestUnlockUpgraded', unlockDest.address)
      assert.equal(await unlockAfterUpgrade.sayHello(), 'hello world')
    })
  })

  describe("execDao", () => {
    it('should revert when not on mainnet', async () => {
      const calldata = ethers.utils.defaultAbiCoder.encode(['uint8', 'bytes' ], [2, '0x'])
      await reverts(
        managerDest.execDAO(calldata),
        'Unauthorized'
      )
    })
  })

  describe("changeMultisig", () => {
    it('can only be called by the multisig itself', async () => {
      await reverts(
        managerDest.changeMultisig(),
        'Unauthorized'
      )
    })

    it('allow the multisig to replace itself', async () => {
      const wallet = await ethers.Wallet.createRandom()
      await managerDest.connect(wallet.address).changeMultisig()
      assert.equal(
        await managerDest.multisigAddress(),
        wallet.address
      )
    })
    it('allow the multisig to remove itself', async () => {
      await managerDest.connect(multisig).changeMultisig(ADDRESS_ZERO)
      assert.equal(
        await managerDest.multisigAddress(),
        ADDRESS_ZERO
      )

      // make sure exec reverts
      const calldata = ethers.utils.defaultAbiCoder.encode(['uint8', 'bytes' ], [2, '0x'])
      await reverts(
        managerDest.connect(multisig).execMultisig(calldata),
        'Unauthorized'
      )
      


    })
  })

});

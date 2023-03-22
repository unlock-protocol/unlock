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
  managerMainnet,
  managerDest,
  unlockDest,
  wethDest,
  proxyAdmin

//
const destChainId = 31337;
const destDomainId = 1734439522;
const srcDomainId = 1

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
    const UnlockManager = await ethers.getContractFactory("UnlockManager");
    
    managerMainnet = await UnlockManager.deploy(
      bridge.address,
      ZERO_ADDRESS, // unlock on mainnet
      dao.address,
      ZERO_ADDRESS, // mutisig
      srcDomainId,
    );
    
    managerDest = await UnlockManager.deploy(
      bridge.address,
      unlockDest.address,
      dao.address, // dao address on mainnet
      multisig.address,
      destDomainId,
    );
    
    // transfer assets to UnlockManager on dest chain
    proxyAdmin = await getProxyAdmin(unlockDest.address)
    await proxyAdmin.transferOwnership(managerDest.address)
    await unlockDest.transferOwnership(managerDest.address)
  });

  describe("constructor", () => {
    it("stores bridge address", async () => {
      assert.equal(bridge.address, await managerMainnet.bridgeAddress());
    });

    it("stores Unlock address properly", async () => {
      assert.equal(
        await managerMainnet.unlockAddress(),
        unlockDest.address
      );
    });

    it("stores the domain properly", async () => {
      assert.equal(await managerMainnet.domain(), destDomainId);
    });

    it("stores DAO address", async () => {
      assert.equal(dao.address, await managerMainnet.daoAddress());
    });
    
    it("stores multisig address", async () => {
      assert.equal(dao.address, await managerMainnet.daoAddress());
    });
  });

  describe("change Unlock settings", () => {
    let calldata
    let args
    before( async () => {
      // deploy template
      const PublicLock = await ethers.getContractFactory('TestPublicLockUpgraded')
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
    it('through the bridge', async () => {
      // make sure settings were ok before
      assert.equal(await unlockDest.publicLockImpls(args[1]), ADDRESS_ZERO);
      assert.equal(await unlockDest.publicLockVersions(args[0]), 0);

      // send through the DAO > mainnet manager > bridge path
      await managerMainnet.connect(dao).dispatch(
        destChainId,
        managerDest.address,
        calldata,
        ZERO_ADDRESS,
        0,
        ZERO_ADDRESS,
        30
      )

      // make sure things have worked correctly
      assert.equal(await unlockDest.publicLockVersions(args[0]), args[1]);
      assert.equal(await unlockDest.publicLockImpls(args[1]), args[0]);
    })
    it('via multisig', async () => {
      
      // make sure settings were ok before
      assert.equal(await unlockDest.publicLockImpls(args[1]), ADDRESS_ZERO);
      assert.equal(await unlockDest.publicLockVersions(args[0]), 0);

      // send through the DAO > mainnet manager > bridge path
      await managerMainnet.connect(multisig).exec(
        calldata
      )

      // make sure things have worked correctly
      assert.equal(await unlockDest.publicLockVersions(args[0]), args[1]);
      assert.equal(await unlockDest.publicLockImpls(args[1]), args[0]);

    })

    it('reverts is dispatc is not called by the DAO', async () => {
      await reverts(
        managerMainnet.dispatch(
          destChainId,
          managerDest.address,
          calldata,
          ZERO_ADDRESS,
          0,
          ZERO_ADDRESS,
          30
        ),
        'Unauthorized'
      )
    })
    
    it('reverts if exec is not called by multisig', async () => {
      await reverts(
        managerDest.exec(calldata),
        'Unauthorized'
      )
    })
  })


  describe("update proxied contract via proxyAdmin", () => {    
    it('can upgrade Unlock from the bridge', async () => {
      const UnlockUpgraded = await ethers.getContractFactory('TestUnlockUpgraded')
      const unlockUpgraded = await UnlockUpgraded.deploy()

      const { interface } = proxyAdmin
      const args = [unlockDest.address, unlockUpgraded.address]
      const proxyAdminCalldata = interface.encodeFunctionData('upgrade', args)
      const calldata = ethers.utils.defaultAbiCoder.encode(['uint8', 'bytes' ], [2, proxyAdminCalldata])

      // send through the dispatcher
      await managerDest.connect(dao).exec(
        calldata
      )

      const unlockAfterUpgrade = await ethers.getContractAt('TestUnlockUpgraded', unlockDest.address)
      assert.equal(await unlockAfterUpgrade.sayHello(), 'hello world')
    })
  })

});

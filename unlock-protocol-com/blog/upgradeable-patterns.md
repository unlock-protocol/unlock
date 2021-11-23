---
title: "Making locks upgradeable"
authorName: Clément Renaud
publishDate: Nov 18, 2021
description: "What are contract upgrades on Ethereum, and how we use, test and deploy them at Unlock"
image: /images/blog/unlocking-smart-contracts/code.jpeg
---

Blockchains like Ethereum exist to prevent recorded data from being altered. Once published, the content of a contract can not be changed. Only values stored by the contract itself can be updated (i.e. balance, owner, etc) but the code itself is immutable. However, the same address can still lead to different contracts. At Unlock, we are about to deploy the 10th version of our main contract but the [address](https://etherscan.io/address/0x3d5409cce1d45233de1d4ebdee74b8e004abdd13) never changed since day one. How are these upgrades made possible? black magic? blocks reorg?

## Proxies on Ethereum

A proxy is a piece of code that acts as an intermediary between the entity doing a request and the provider answering it. Instead of directly calling a program, you call the proxy that will take care of passing your demand and brings you back what you asked. As a provider, the proxy will take charge of handling all the incoming, forwarding only what asked.

On Ethereum, *proxy contracts* are used to forward call to an end contract that does the heavy lifting - often called *implementation*. If you decide to change the way the contract behaves, you just need to point the proxy to a new implementation, and tell him to forward things there. Requests can still be sent to the same address (the address of the proxy) but the behaviour may have changed.

This pattern turns out very useful when developing a product like Unlock, because it allows us to upgrade contracts to provide new features, fix known issues, etc.

## Potential storage conflicts

Upgrading a contract is not like updating a web page though. Everything on-chain is unreversible and mistakes are very costly, destroying entire projects - and accessorily costing tons of gas for a simple upgrade.

One important risk is *storage conflicts*. On Ethereum, contracts have their own storage for persitent information. A simple token contract keeps addresses of all the holders in its storage. The storage lives in the almighty Ethereum Virtual Machine (EVM) and takes the form of a very long list, initially full of zeros. When a contract is compiled, each variable is assigned a *slot* in the storage following their order in the contract. When data is stored, the EVM picks some of the zeros in the corresponding slots and replace them with the new value.

![](https://programtheblockchain.com/storage/fixed.png)

*Anatomy of a storage slot, from a good [write-up](https://programtheblockchain.com/posts/2018/03/09/understanding-ethereum-smart-contract-storage/).*

When using a proxy, the calls are forwarded to the end/implementation contract, but the data is stored within the proxy itself. To know how to store it, the proxy reads variable from the end contract to define the slots. That means data will be kept when the end contract changes. That also means that if variables changes in the end contract, the storage layout ends up being modified. In certain cases, conflicts in slots can occur, making it impossible for the proxy to find existing slots - or even leading it to erase them.

To prevent this type of conflict in storage from happening, we at Unlock rely on the [Open Zeppelin upgrades library](https://docs.openzeppelin.com/upgrades/2.8/) to ensure that storage layout is compatible before proceding to any upgrade.

## Testing upgrades

Despite avoiding technical failures, we have to make sure to preserve existing features from our contracts during upgrades - and add some new ones! We have an extensive test suite to check that each function does what it is supposed to. However, many features of Unlock relies on external resources, tokens and oracle contracts which is harder to enforce. The complex set of dependencies is hard to recreate locally, so we came up with solutions to tackle it.

First, we developed a set of scripts that are used both for local development and multi-chains deployment. Powered by [hardhat](https://hardhat.org), we now have [tools](https://github.com/unlock-protocol/unlock/tree/master/smart-contracts/scripts) to deploy and configure our contracts, submit DAO proposals, upgrade contracts, etc. Before sending an upgade, we run relevant tests on a [local fork of Ethereum mainnet](https://hardhat.org/hardhat-network/guides/mainnet-forking.html), then proceed to an upgrade and finally run the test again against the upgraded version. That way we can check that our contracts behaviours are preserved after an upgrade.

```shell
$ yarn hardhat

AVAILABLE TASKS:

  ...
  deploy           	Deploy the entire Unlock protocol
  deploy:governor  	Deploy Governor Alpha contracts
  deploy:oracle    	Deploy UDT <> WETH oracle contract
  deploy:template  	Deploy PublicLock contract
  deploy:udt       	Deploy Unlock Discount Token proxy
  deploy:uniswap   	Deploy Uniswap V2 Factory and Router
  deploy:unlock    	Deploy Unlock proxy
  deploy:weth      	Deploy WETH contract
  ...
  gov:delegate     	Delagate voting power
  gov:submit       	Submit a proposal to UDT Governor contract
  gov:vote         	Vote for a proposal on UDT Governor contract
  ...
  impl             	Get the contract implementation address
  ...
  upgrade          	Upgrade an existing contract with a new implementation
  upgrade:prepare  	Deploy the implementation of an upgreadable contract
  upgrade:propose  	Send an upgrade implementation proposal to multisig
  ...
  verify           	Verifies contract on Etherscan
  ...
```

## Upgrading contract from another contract

Besides making our main contracts upgradeable, we started to add the upgrade logic inside our product itself. When you deploy a lock with Unlock, a new instance of the `PublicLock` contract (ERC-721) is created with the parameters you defined (name, token, etc). In Solidity, several patterns exist to [deploy a contract from another contract](https://github.com/clemsos/sol-upgrade-pattern/). The previous version of Unlock was using a *Minimal Proxy* (EIP-1167). Instead of deploying the entire contract for each new lock created, a small proxy is deployed just to hold the data and forward calls to a main instance that deals with all the incoming. That allowed to save a non-negligeable amount of gas when deploying a new lock instance.

However, the minimal proxy approach _did not allow for upgrades_. We wanted all locks to benefit from the latest features available so we started to investigate how we could deploy a full proxy from a contract and **allow users to upgrade their locks** when new features were released. The problem was twofold: 1) allow all managers of a lock to upgrade themselves (keep things decentralized), 2) make sure upgrades are safe.

We used Open Zeppelin [TransparentProxy](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.3.0/contracts/proxy/transparent/TransparentUpgradeableProxy.sol) pattern, and added the following logic to our contract :

* when a lock is created:
    * deploy a proxy
    * point it to the latest implemtation

* when a lock is upgraded:
    * check if the caller is authorized as a lock manager
    * point to the new implementation

We decided to store a single [`ProxyAdmin`](https://docs.openzeppelin.com/contracts/4.x/api/proxy#ProxyAdmin) instance in our main contract that will take care of all the upgrade process. When `upgradeLock` is called, our main contract will check into the deployed lock if the caller is a lock manager. If yes, our proxy admin will proceed to upgrade the lock. If not, the upgrade will be rejected.

```solidity
/**
   * @dev Upgrade a Lock template implementation
   * @param lockAddress the address of the lock to be upgraded
   * @param version the version number of the template
   */
  function upgradeLock(address payable lockAddress, uint16 version) public returns(address) {
    require(proxyAdminAddress != address(0), "proxyAdmin is not set");

    // check perms
    require(_isLockManager(lockAddress, msg.sender) == true, "caller is not a manager of this lock");

    // check version
    IPublicLock lock = IPublicLock(lockAddress);
    uint16 currentVersion = lock.publicLockVersion();
    require( version == currentVersion + 1, 'version error: only +1 increments are allowed');

    // make our upgrade
    address impl = _publicLockImpls[version];
    TransparentUpgradeableProxy proxy = TransparentUpgradeableProxy(lockAddress);
    proxyAdmin.upgrade(proxy, impl);

    emit LockUpgraded(lockAddress, version);
    return lockAddress;
  }
```

The various versions are stored in the contract with a version number and its corresponding implementation. For instance, lock managers can launch an upgrade by calling `upgradeLock(0x...lockAddress, 10)` to upgrade their lock to version 10 - or through the dashboard. For better compatibility, we forbid bumps of more than one version number (so version 9 to 10 works, but 8 to 10 will fail).

## Coming release

We are now finalising a new version of the lock template with more features and a few fixes that should come with the upgradeable version! Stay tuned :)
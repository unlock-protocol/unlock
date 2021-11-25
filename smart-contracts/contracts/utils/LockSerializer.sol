// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import 'hardhat/console.sol';
import '../interfaces/IPublicLock.sol';

contract LockSerializer {

  constructor () {}

  struct Lock {
      
    // keys
    uint expirationDuration;
    uint keyPrice;
    uint maxNumberOfKeys;
    address beneficiary;

    // protocol
    uint publicLockVersion;
    address tokenAddress;
    
    // fees
    uint256 freeTrialLength;
    uint256 refundPenaltyBasisPoints;
    uint256 transferFeeBasisPoints;

    // metadata
    string name;
    string symbol;
    
    // ownerhsip
    uint numberOfOwners;
    uint256 totalSupply; 
    
    // address lockCreator;
    // string baseTokenURI; // private?
    // keyOwners
    // keyManagers //keyManagerOf
  }

  function serialize(address lockAddress) public view returns (Lock memory) {

    IPublicLock lock = IPublicLock(lockAddress); 
    require( lock.isAlive() == true, "Disabled lock can not be serialized");

    // address lockCreator = lock.lockCreator();
    uint expirationDuration = lock.expirationDuration();
    address tokenAddress = lock.tokenAddress();
    uint keyPrice = lock.keyPrice();
    uint maxNumberOfKeys = lock.maxNumberOfKeys();

    address beneficiary = lock.beneficiary();
    uint publicLockVersion = lock.publicLockVersion();
    string memory symbol = lock.symbol();
    uint256 freeTrialLength = lock.freeTrialLength();
    uint256 refundPenaltyBasisPoints = lock.refundPenaltyBasisPoints();
    uint256 transferFeeBasisPoints = lock.transferFeeBasisPoints();
    string memory name = lock.name();
    uint256 totalSupply = lock.totalSupply();
    uint numberOfOwners = lock.numberOfOwners();

    Lock memory serializedLock = Lock(
      // keys
      expirationDuration,
      keyPrice,
      maxNumberOfKeys,
      beneficiary,
      // protocol
      publicLockVersion,
      tokenAddress,
      // fees
      freeTrialLength,
      refundPenaltyBasisPoints,
      transferFeeBasisPoints,
      // metadata
      name,
      symbol,
      // ownerhsip
      numberOfOwners,
      totalSupply
    );

    return serializedLock;
  }

}
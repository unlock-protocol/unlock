// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import 'hardhat/console.sol';
import '@unlock-protocol/contracts/dist/PublicLock/IPublicLockV8sol8.sol';

contract LockSerializer {

  constructor () {}

  event LockCLoned(
    address newLockAddress
  );

  struct Lock {
      
    // priceInfo
    uint expirationDuration;
    uint keyPrice;
    uint maxNumberOfKeys;
    address beneficiary;

    // fees
    uint256 freeTrialLength;
    uint256 refundPenaltyBasisPoints;
    uint256 transferFeeBasisPoints;

    // metadata
    string name;
    string symbol;
    // string baseTokenURI; // private?
    
    // protocol
    uint publicLockVersion;
    address tokenAddress;

    // ownerhsip
    uint numberOfOwners;
    uint256 totalSupply; 
    address[] keyOwners;
    uint[] expirationTimestamps;
    // address lockCreator;
    // keyManagers //keyManagerOf
  }

  // We split in multiple structs to avoid "Stack To Deep" solc
  struct LockPriceInfo {
    // fees
    uint expirationDuration;
    uint keyPrice;
    uint maxNumberOfKeys;
    address beneficiary;
  }
  
  struct LockFees {
    // fees
    uint256 freeTrialLength;
    uint256 refundPenaltyBasisPoints;
    uint256 transferFeeBasisPoints;
  }

  struct LockMetadata {
    // metadata
    string name;
    string symbol;
    // string baseTokenURI; // private?
  }

  function serializePriceInfo(IPublicLockV8 lock) public view returns (LockPriceInfo memory) {
    uint expirationDuration = lock.expirationDuration();
    uint keyPrice = lock.keyPrice();
    uint maxNumberOfKeys = lock.maxNumberOfKeys();
    address beneficiary = lock.beneficiary();
    return LockPriceInfo(
      expirationDuration,
      keyPrice,
      maxNumberOfKeys,
      beneficiary
    );
  }
  
  function serializeFees(IPublicLockV8 lock) public view returns (LockFees memory) {
    uint256 freeTrialLength = lock.freeTrialLength();
    uint256 refundPenaltyBasisPoints = lock.refundPenaltyBasisPoints();
    uint256 transferFeeBasisPoints = lock.transferFeeBasisPoints();
    return LockFees(
      freeTrialLength,
      refundPenaltyBasisPoints,
      transferFeeBasisPoints
    );
  }
  
  function serializeMetadata(IPublicLockV8 lock) public view returns (LockMetadata memory) {
    string memory name = lock.name();
    string memory symbol = lock.symbol();
    return LockMetadata(
      name,
      symbol
    );
  }

  function serialize(address lockAddress) public view returns (Lock memory) {

    IPublicLockV8 lock = IPublicLockV8(lockAddress); 
    require( lock.isAlive() == true, "Disabled lock can not be serialized");
    
    LockMetadata memory metadata = serializeMetadata(lock);
    LockFees memory fees = serializeFees(lock);
    LockPriceInfo memory priceInfo = serializePriceInfo(lock);

    // protocol
    uint publicLockVersion = lock.publicLockVersion();
    address tokenAddress = lock.tokenAddress();

    // ownership
    uint256 totalSupply = lock.totalSupply();
    uint numberOfOwners = lock.numberOfOwners();
    
    address[] memory keyOwners;
    if (lock.publicLockVersion() < 9 && numberOfOwners > 0) {
      // TODO: pagination - how many addresses will overflow?
      keyOwners = lock.getOwnersByPage(0, numberOfOwners);
    }
    // expirations
    uint[] memory expirationTimestamps = new uint[](numberOfOwners);
    if(keyOwners.length != 0) {
      for (uint256 i = 0; i < keyOwners.length; i++) {
        expirationTimestamps[i] = lock.keyExpirationTimestampFor(keyOwners[i]);
      }
    }
    
    Lock memory serializedLock = Lock(
      // keys
      priceInfo.expirationDuration,
      priceInfo.keyPrice,
      priceInfo.maxNumberOfKeys,
      priceInfo.beneficiary,
      // fees
      fees.freeTrialLength,
      fees.refundPenaltyBasisPoints,
      fees.transferFeeBasisPoints,
      // metadata
      metadata.name,
      metadata.symbol,
      // protocol
      publicLockVersion,
      tokenAddress,
      // ownerhsip
      numberOfOwners,
      totalSupply,
      keyOwners,
      expirationTimestamps
    );

    return serializedLock;
  }
}
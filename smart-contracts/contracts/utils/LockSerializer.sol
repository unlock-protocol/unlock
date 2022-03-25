// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import 'hardhat/console.sol';
import '../interfaces/IPublicLock.sol';

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
    string tokenURISample;
    
    // protocol
    uint publicLockVersion;
    address tokenAddress;

    // ownerhsip
    uint numberOfOwners;
    uint256 totalSupply; 
    address[] keyOwners;
    address[] keyManagers;
    uint[] expirationTimestamps;
    // address lockCreator;
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
    string tokenURISample;
  }

  function serializePriceInfo(IPublicLock lock) public view returns (LockPriceInfo memory) {
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
  
  function serializeFees(IPublicLock lock) public view returns (LockFees memory) {
    uint256 freeTrialLength = lock.freeTrialLength();
    uint256 refundPenaltyBasisPoints = lock.refundPenaltyBasisPoints();
    uint256 transferFeeBasisPoints = lock.transferFeeBasisPoints();
    return LockFees(
      freeTrialLength,
      refundPenaltyBasisPoints,
      transferFeeBasisPoints
    );
  }
  
  function serializeMetadata(IPublicLock lock) public view returns (LockMetadata memory) {
    string memory name = lock.name();
    string memory symbol = lock.symbol();

    // get the latest TokenURI to use as sample
    uint totalSupply = lock.totalSupply();
    string memory tokenURISample = lock.tokenURI(totalSupply);

    return LockMetadata(
      name,
      symbol,
      tokenURISample
    );
  }

  function serialize(address lockAddress) public view returns (Lock memory) {

    IPublicLock lock = IPublicLock(lockAddress); 
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
    
    // keys
    address[] memory keyOwners = new address[](totalSupply);
    address[] memory keyManagers = new address[](totalSupply);
    uint[] memory expirationTimestamps = new uint[](totalSupply);
    
    // tokenId starts at 1, so totalSupply + 1 is needed
    for (uint256 i = 0; i < totalSupply; i++) {
      uint256 tokenId = i +1;
      keyOwners[i] = lock.ownerOf(tokenId);
      expirationTimestamps[i] = lock.keyExpirationTimestampFor(tokenId);
      keyManagers[i] = lock.keyManagerOf(tokenId);
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
      metadata.tokenURISample,
      // protocol
      publicLockVersion,
      tokenAddress,
      // ownerhsip
      numberOfOwners,
      totalSupply,
      keyOwners,
      keyManagers,
      expirationTimestamps
    );

    return serializedLock;
  }
}
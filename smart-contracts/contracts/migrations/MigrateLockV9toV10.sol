// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import '../interfaces/IPublicLock.sol';

contract MigrateLockV9toV10 {

    /**
     * Returns the target version of the Lock for the current migration script
     */
    function target () external pure returns (uint) {
      return 10;
    }

     /**
  * Migrate data from the previous single owner => key mapping to 
  * the new data structure w multiple tokens.
  * for v10: `(uint _startIndex, uint nbRecordsToUpdate)`
  * * @param _lockAddress : the address of the lock to update
  * * @param _startIndex : the index of the first record to migrate
  * * @param _nbRecordsToUpdate : number of records to migrate
  * @return updatedRecordsCount the number of records that have been updated
  * @dev if all records can be processed at once, the `schemaVersion` will be updated
  * if not, you will have to call `updateSchemaVersion`
  * variable to the latest/current lock version
  */
    function migrate (
      address _lockAddress,
      uint _startIndex,
      uint _nbRecordsToUpdate
    ) public 
      returns (
        // counter for the records that will be migrated
        uint updatedRecordsCount
      ) {

        // script can only be called from the lock itself
        require(msg.sender == _lockAddress, 'UNAUTHORIZED');

        // parse the lock
        IPublicLock lock = IPublicLock(_lockAddress);

        // the total number of records to migrate
        uint totalSupply = lock.totalSupply();

        // cap the number of records to migrate to totalSupply
        uint nbRecordsToUpdate =  _nbRecordsToUpdate > totalSupply ? totalSupply : _nbRecordsToUpdate;

        for (uint256 i = _startIndex; i < _startIndex + nbRecordsToUpdate; i++) {
            // tokenId starts at 1
            uint tokenId = i + 1;
            address keyOwner = lock.ownerOf(tokenId);

            // migrate the key
            bool migrated = lock.migrateKey(tokenId);
            if(migrated) {
                // keep track of updated records
                updatedRecordsCount++;
            }
        }
        
        // enable lock if all keys has been migrated in a single run
        if(nbRecordsToUpdate >= totalSupply) {
            lock.updateSchemaVersion();
        }
    }
}
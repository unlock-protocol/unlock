// SPDX-License-Identifier: MIT
pragma solidity >=0.5.17 <0.9.0;

interface IMigrateLockV9toV10
{
  /**
  * Migrate data from the previous single owner => key mapping to 
  * the new data structure w multiple tokens.
  * for v10: `(uint _startIndex, uint nbRecordsToUpdate)`
  * * @param _lockAddress : the address of the lock to update
  * * @param _startIndex : the index of the first record to migrate
  * * @param _nbRecordsToUpdate : number of records to migrate
  * @dev if all records can be processed at once, the `schemaVersion` of the lock will be updated
  * if not, you will have to call `updateSchemaVersion`
  * variable to the latest/current lock version
  */
  function migrate(address _lockAddress,
        uint _startIndex,
        uint _nbRecordsToUpdate) external returns (uint256);

  /**
  * Returns the target version of the Lock for the current migration script
  */
  function target () external pure;
}
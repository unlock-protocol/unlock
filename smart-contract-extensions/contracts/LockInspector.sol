pragma solidity ^0.5.0;

import 'unlock-abi-1-3/IPublicLockV6.sol';

/**
 * @notice Read-only calls to ease reviewing a lock's details.
 */
contract LockInspector
{
 /**
  * @notice A function which returns a subset of the keys for this Lock as an array
  * @param _lock the address of the lock to check
  * @param _page the page of key owners requested when faceted by page size
  * @param _pageSize the number of Key Owners requested per page
  */
  function getOwnersByPage(
    IPublicLock _lock,
    uint _page,
    uint _pageSize
  ) external view
    returns (address[] memory)
  {
    uint pageSize = _pageSize;
    uint startIndex = _page * pageSize;
    uint endOfPageIndex;
    uint ownerCount = _lock.numberOfOwners();

    if(startIndex + pageSize > ownerCount)
    {
      endOfPageIndex = ownerCount;
      pageSize = ownerCount - startIndex;
    }
    else
    {
      endOfPageIndex = (startIndex + pageSize);
    }

    // new temp in-memory array to hold pageSize number of requested owners:
    address[] memory ownersByPage = new address[](pageSize);
    uint pageIndex = 0;

    // Build the requested set of owners into a new temporary array:
    for (uint i = startIndex; i < endOfPageIndex; i++)
    {
      ownersByPage[pageIndex] = _lock.owners(i);
      pageIndex++;
    }

    return ownersByPage;
  }
}

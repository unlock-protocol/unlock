/* solhint-disable no-empty-blocks */

pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./ERC721.sol";
import "./ILockCore.sol";


/**
 * @title The Lock interface
 * @author HardlyDifficult (unlock-protocol.com)
 * @dev Lock smart contracts are ERC721 compatible smart contracts.
 *  However, they have some specificities:
 *  - Since each address owns at most one single key, the tokenId is equal to the owner
 *  - Each address owns at most one single key (ERC721 allows for multiple owned NFTs)
 *  - When transfering the key, we actually reset the expiration date on the transfered key to now
 *    and assign its previous expiration date to the new owner. This is important because it prevents
 *    some abuse around referrals.
 */
contract ILockPublic is ILockCore, ERC721, Ownable {
}

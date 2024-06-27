import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "../interfaces/IPublicLock.sol";

contract Kickback {
  event RefundsApproved(address lockAddress, bytes32 root);
  event Refunded(address lockAddress, address recipient, uint256 amount);

  mapping(address => mapping(address => uint)) public issuedRefunds;
  mapping(address => bytes32) public roots;

  function approveRefunds(address lockAddress, bytes32 root) public {
    IPublicLock lock = IPublicLock(lockAddress);
    require(
      lock.isLockManager(address(this)),
      "Add the Kickback contract as a lock manager first."
    );
    require(
      lock.isLockManager(msg.sender),
      "You must be a lock manager to approve refunds."
    );
    roots[lockAddress] = root;
    emit RefundsApproved(lockAddress, root);
  }

  function refund(
    address lockAddress,
    bytes32[] memory proof,
    uint256 amount
  ) public {
    bytes32 leaf = keccak256(
      bytes.concat(keccak256(abi.encode(msg.sender, amount)))
    );

    require(
      MerkleProof.verify(proof, roots[lockAddress], leaf),
      "Invalid proof"
    );
    require(
      issuedRefunds[lockAddress][msg.sender] == 0,
      "Refund already issued"
    );
    issuedRefunds[lockAddress][msg.sender] = amount;

    IPublicLock lock = IPublicLock(lockAddress);

    lock.withdraw(lock.tokenAddress(), payable(msg.sender), amount);

    emit Refunded(lockAddress, msg.sender, amount);
  }
}

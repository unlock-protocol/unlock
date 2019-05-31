pragma solidity 0.5.9;


// This contract documents the revert reasons used in Unlock and Lock contracts.
// This is intended to serve as a reference, but is not actually used for efficiency reasons.
contract UnlockErrors {
  // The target user already owns a valid key for this lock.
  string public constant ALREADY_OWNS_KEY = 'ALREADY_OWNS_KEY';

  // You can't approve yourself.
  string public constant APPROVE_SELF = 'APPROVE_SELF';

  // The Lock is still active, call disable before this action is allowed
  string public constant DISABLE_FIRST = 'DISABLE_FIRST';

  // The specified value must be greater than 0.
  string public constant GREATER_THAN_ZERO = 'GREATER_THAN_ZERO';

  // The specified address is not valid (i.e. must not be 0).
  string public constant INVALID_ADDRESS = 'INVALID_ADDRESS';

  // The address provided does not appear to represent a valid ERC20 token.
  string public constant INVALID_TOKEN = 'INVALID_TOKEN';

  // The specified rate is not valid, the denominator must be greater than 0.
  // To set the rate to 0, set the numerator to 0 and the denominator to 1.
  string public constant INVALID_RATE = 'INVALID_RATE';

  // The user does not have a valid key, they may or may not have purchased one previously.
  string public constant KEY_NOT_VALID = 'KEY_NOT_VALID';

  // This Lock has been deprecated and this function is now blocked.
  string public constant LOCK_DEPRECATED = 'LOCK_DEPRECATED';

  // This Lock has already sold the maximum number of keys allowed.
  string public constant LOCK_SOLD_OUT = 'LOCK_SOLD_OUT';

  // Locks must expire in 100 years or less.
  string public constant MAX_EXPIRATION_100_YEARS = 'MAX_EXPIRATION_100_YEARS';

  // The fallback function is not supported.
  string public constant NO_FALLBACK = 'NO_FALLBACK';

  // There are no outstanding keys
  string public constant NO_OUTSTANDING_KEYS = 'NO_OUTSTANDING_KEYS';

  // The user has never purchased a key for this lock.
  string public constant NO_SUCH_KEY = 'NO_SUCH_KEY';

  // No approved recipient exists
  string public constant NONE_APPROVED = 'NONE_APPROVED';

  // Not enough funds available for the requested action.
  string public constant NOT_ENOUGH_FUNDS = 'NOT_ENOUGH_FUNDS';

  // The requested feature has not yet been implemented.
  string public constant NOT_IMPLEMENTED = 'NOT_IMPLEMENTED';

  // This function may only be called by the key owner.
  string public constant ONLY_KEY_OWNER = 'ONLY_KEY_OWNER';

  // This function may only be called by the key owner or by a user approved to spend on their behalf.
  string public constant ONLY_KEY_OWNER_OR_APPROVED = 'ONLY_KEY_OWNER_OR_APPROVED';

  // This function may only be called a Lock contract deployed by Unlock.
  string public constant ONLY_LOCKS = 'ONLY_LOCKS';

  // This function may only be called once, and it already has been.
  string public constant ONLY_CALL_ONCE = 'ONLY_CALL_ONCE';

  // This contract does NOT implement the IERC721Receiver interface.
  string public constant NON_COMPLIANT_ERC721_RECEIVER = 'NON_COMPLIANT_ERC721_RECEIVER';

  // This address has never owned a key for this lock
  string public constant HAS_NEVER_OWNED_KEY = 'HAS_NEVER_OWNED_KEY';
}
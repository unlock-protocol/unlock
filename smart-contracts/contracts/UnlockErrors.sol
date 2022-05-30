// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title List of all error messages 
 * (replace string errors message to save on contract size)
 */
library UnlockErrors {

  string public constant OUT_OF_RANGE = '0';
  string public constant NULL_VALUE = '1';
  string public constant INVALID_ADDRESS = '2';
  string public constant INVALID_TOKEN = '3';

  // erc 721
  string public constant NON_COMPLIANT_ERC721_RECEIVER = '4';

  // roles
  string public constant ONLY_LOCK_MANAGER_OR_KEY_GRANTER = '5';
  string public constant ONLY_KEY_MANAGER_OR_APPROVED = '6';
  string public constant UNAUTHORIZED_KEY_MANAGER_UPDATE = '7';
  string public constant ONLY_LOCK_MANAGER_OR_BENEFICIARY = '8';
  string public constant ONLY_LOCK_MANAGER = '9';

  // single key status
  string public constant KEY_NOT_VALID = '10';
  string public constant NO_SUCH_KEY = '11';

  // migration & data schema
  string public constant SCHEMA_VERSION_NOT_CORRECT = '12';
  string public constant MIGRATION_REQUIRED = '13';

  // lock status/settings
  string public constant OWNER_CANT_BE_ADDRESS_ZERO = '14';
  string public constant MAX_KEYS = '15';
  string public constant NON_EXPIRING_LOCK = '16';
  string public constant NON_ERC20_LOCK = '17';
  string public constant KEY_TRANSFERS_DISABLED = '18';

  // transfers and approvals
  string public constant TRANSFER_FROM_NOT_KEY_OWNER = '19';
  string public constant TRANSFER_TO_SELF = '20';
  string public constant CANNOT_APPROVE_SELF = '21';
  string public constant APPROVE_SELF = '22';

  // 
  string public constant OWNER_INDEX_OUT_OF_BOUNDS = '23';
  string public constant CANT_EXTEND_NON_EXPIRING_KEY = '24 ';
  string public constant NOT_ENOUGH_TIME = '25';
  string public constant SMALLER_THAN_SUPPLY = '26 ';
  string public constant NOT_ENOUGH_FUNDS = '27';

  // keys management 
  string public constant LOCK_SOLD_OUT = '28';
  string public constant INVALID_REFERRERS_LENGTH = '29';
  string public constant INVALID_KEY_MANAGERS_LENGTH = '30 ';

  // purchase
  string public constant INSUFFICIENT_ERC20_VALUE = '31';
  string public constant INSUFFICIENT_VALUE = '32';

  // renewals
  string public constant PRICE_CHANGED = '33';
  string public constant DURATION_CHANGED = '34';
  string public constant TOKEN_CHANGED = '35';
  string public constant NOT_READY = '36';

  // gas refund
  string public constant GAS_REFUND_FAILED = '37';

  // hooks
  string public constant INVALID_ON_KEY_SOLD_HOOK = '38';
  string public constant INVALID_ON_KEY_CANCEL_HOOK = '39';
  string public constant INVALID_ON_VALID_KEY_HOOK = '40';
  string public constant INVALID_ON_TOKEN_URI_HOOK = '41';

}

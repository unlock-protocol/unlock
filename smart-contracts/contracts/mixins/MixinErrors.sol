// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title List of all error messages 
 * (replace string errors message to save on contract size)
 */
contract MixinErrors {

  string internal constant OUT_OF_RANGE = '0';
  string internal constant NULL_VALUE = '1';
  string internal constant INVALID_ADDRESS = '2';
  string internal constant INVALID_TOKEN = '3';

  // erc 721
  string internal constant NON_COMPLIANT_ERC721_RECEIVER = '4';

  // roles
  string internal constant ONLY_LOCK_MANAGER_OR_KEY_GRANTER = '5';
  string internal constant ONLY_KEY_MANAGER_OR_APPROVED = '6';
  string internal constant UNAUTHORIZED_KEY_MANAGER_UPDATE = '7';
  string internal constant ONLY_LOCK_MANAGER_OR_BENEFICIARY = '8';
  string internal constant ONLY_LOCK_MANAGER = '9';

  // single key status
  string internal constant KEY_NOT_VALID = '10';
  string internal constant NO_SUCH_KEY = '11';

  // migration & data schema
  string internal constant SCHEMA_VERSION_NOT_CORRECT = '12';
  string internal constant MIGRATION_REQUIRED = '13';

  // lock status/settings
  string internal constant OWNER_CANT_BE_ADDRESS_ZERO = '14';
  string internal constant MAX_KEYS = '15';
  string internal constant NON_EXPIRING_LOCK = '16';
  string internal constant NON_ERC20_LOCK = '17';
  string internal constant KEY_TRANSFERS_DISABLED = '18';

  // transfers and approvals
  string internal constant TRANSFER_FROM_NOT_KEY_OWNER = '19';
  string internal constant TRANSFER_TO_SELF = '20';
  string internal constant CANNOT_APPROVE_SELF = '21';
  string internal constant APPROVE_SELF = '22';

  // 
  string internal constant OWNER_INDEX_OUT_OF_BOUNDS = '23';
  string internal constant CANT_EXTEND_NON_EXPIRING_KEY = '24 ';
  string internal constant NOT_ENOUGH_TIME = '25';
  string internal constant SMALLER_THAN_SUPPLY = '26 ';
  string internal constant NOT_ENOUGH_FUNDS = '27';

  // keys management 
  string internal constant LOCK_SOLD_OUT = '28';
  string internal constant INVALID_REFERRERS_LENGTH = '29';
  string internal constant INVALID_KEY_MANAGERS_LENGTH = '30 ';

  // purchase
  string internal constant INSUFFICIENT_ERC20_VALUE = '31';
  string internal constant INSUFFICIENT_VALUE = '32';

  // renewals
  string internal constant PRICE_CHANGED = '33';
  string internal constant DURATION_CHANGED = '34';
  string internal constant TOKEN_CHANGED = '35';
  string internal constant NOT_READY = '36';

  // gas refund
  string internal constant GAS_REFUND_FAILED = '37';

  // hooks
  string internal constant INVALID_ON_KEY_SOLD_HOOK = '38';
  string internal constant INVALID_ON_KEY_CANCEL_HOOK = '39';
  string internal constant INVALID_ON_VALID_KEY_HOOK = '40';
  string internal constant INVALID_ON_TOKEN_URI_HOOK = '41';

}

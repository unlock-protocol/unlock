// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title List of all error messages 
 * (replace string errors message to save on contract size)
 */
contract MixinErrors {

  string constant OUT_OF_RANGE = '0';
  string constant NULL_VALUE = '1';
  string constant INVALID_ADDRESS = '2';
  string constant INVALID_TOKEN = '3';

  // erc 721
  string constant NON_COMPLIANT_ERC721_RECEIVER = '4';

  // roles
  string constant ONLY_LOCK_MANAGER_OR_KEY_GRANTER = '5';
  string constant ONLY_KEY_MANAGER_OR_APPROVED = '6';
  string constant UNAUTHORIZED_KEY_MANAGER_UPDATE = '7';
  string constant ONLY_LOCK_MANAGER_OR_BENEFICIARY = '8';
  string constant ONLY_LOCK_MANAGER = '9';

  // single key status
  string constant KEY_NOT_VALID = '10';
  string constant NO_SUCH_KEY = '11';

  // migration & data schema
  string constant SCHEMA_VERSION_NOT_CORRECT = '12';
  string constant MIGRATION_REQUIRED = '13';

  // lock status/settings
  string constant OWNER_CANT_BE_ADDRESS_ZERO = '14';
  string constant MAX_KEYS = '15';
  string constant NON_EXPIRING_LOCK = '16';
  string constant NON_ERC20_LOCK = '17';
  string constant KEY_TRANSFERS_DISABLED = '18';

  // transfers and approvals
  string constant TRANSFER_FROM_NOT_KEY_OWNER = '19';
  string constant TRANSFER_TO_SELF = '20';
  string constant CANNOT_APPROVE_SELF = '21';
  string constant APPROVE_SELF = '22';

  // 
  string constant OWNER_INDEX_OUT_OF_BOUNDS = '23';
  string constant CANT_EXTEND_NON_EXPIRING_KEY = '24 ';
  string constant NOT_ENOUGH_TIME = '25';
  string constant SMALLER_THAN_SUPPLY = '26 ';
  string constant NOT_ENOUGH_FUNDS = '27';

  // keys management 
  string constant LOCK_SOLD_OUT = '28';
  string constant INVALID_REFERRERS_LENGTH = '29';
  string constant INVALID_KEY_MANAGERS_LENGTH = '30 ';

  // purchase
  string constant INSUFFICIENT_ERC20_VALUE = '31';
  string constant INSUFFICIENT_VALUE = '32';

  // renewals
  string constant PRICE_CHANGED = '33';
  string constant DURATION_CHANGED = '34';
  string constant TOKEN_CHANGED = '35';
  string constant NOT_READY = '36';

  // gas refund
  string constant GAS_REFUND_FAILED = '37';

  // hooks
  string constant INVALID_ON_KEY_SOLD_HOOK = '38';
  string constant INVALID_ON_KEY_CANCEL_HOOK = '39';
  string constant INVALID_ON_VALID_KEY_HOOK = '40';
  string constant INVALID_ON_TOKEN_URI_HOOK = '41';

}

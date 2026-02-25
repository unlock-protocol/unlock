# Implementation Guide: Membership Renewal Status Filter

## Overview
Add a renewal status filter to the membership UI that allows filtering by membership renewal status (will renew, won't renew due to various reasons). This filter should only appear for recurring locks.

## Backend Implementation (Locksmith API)

### 1. Add RenewalStatus Type Definition
**File**: `locksmith/src/operations/subscriptionOperations.ts`

```typescript
export type RenewalStatus =
  | 'all'
  | 'will_renew'
  | 'wont_renew_expired_card'
  | 'wont_renew_cancelled'
  | 'wont_renew_insufficient_funds'
```

### 2. Add Renewal Status Filter Logic
**File**: `locksmith/src/operations/subscriptionOperations.ts`

Implement `applyRenewalStatusFilter()` function to filter keys based on subscription status.

### 3. Update Key Listing Function
**File**: `locksmith/src/operations/keyOperations.ts`

Add `renewalStatus` parameter to filter keys query.

### 4. Update Key Controller
**File**: `locksmith/src/controllers/v2/keyController.ts`

Add `renewalStatus` query parameter extraction and pass to operations.

### 5. Update API Routes (if needed)
**File**: `locksmith/src/routes/v2/keys.ts`

Add validation for `renewalStatus` parameter.

## Frontend Implementation (unlock-app)

### 1. Add RenewalStatus Enum
**File**: `unlock-app/src/components/interface/locks/Manage/elements/FilterBar.tsx`

```typescript
export enum RenewalStatus {
  ALL = 'all',
  WILL_RENEW = 'will_renew',
  WONT_RENEW_EXPIRED_CARD = 'wont_renew_expired_card',
  WONT_RENEW_CANCELLED = 'wont_renew_cancelled',
  WONT_RENEW_INSUFFICIENT_FUNDS = 'wont_renew_insufficient_funds',
}
```

### 2. Update FilterBar Component
**File**: `unlock-app/src/components/interface/locks/Manage/elements/FilterBar.tsx`

- Add `renewalStatus` and `onChangeRenewalStatus` props
- Add `isRecurringLock` prop
- Conditionally render renewal status filter only when `isRecurringLock` is true

### 3. Update Members Component
**File**: `unlock-app/src/components/interface/locks/Manage/elements/Members.tsx`

- Add `renewalStatus` to local filter state
- Detect if lock is recurring
- Pass `renewalStatus` to FilterBar and API calls

### 4. Update Locksmith Client
**File**: `unlock-app/src/config/locksmith.ts`

- Add `renewalStatus` parameter to `keysByPage()` or equivalent method
- Append to query string when calling API

## Testing Checklist

- [ ] API endpoint accepts `renewalStatus` parameter
- [ ] API returns correct keys for each renewal status value
- [ ] Filter dropdown only shows for locks with `recurringPayments` enabled
- [ ] Filter works in combination with other filters
- [ ] Pagination works correctly with renewal status filter
- [ ] Non-recurring locks don't show the renewal status filter
- [ ] Error handling for invalid filter values

## Notes

- Ensure database fields exist: `KeySubscription.cancelled`, `KeySubscription.paymentMethodValid`, `KeySubscription.paymentFailureReason`
- The filter should gracefully degrade if subscription data is missing
- Consider performance implications when filtering large datasets

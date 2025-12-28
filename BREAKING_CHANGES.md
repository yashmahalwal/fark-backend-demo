# Breaking Changes in Feature Branch

This document describes all breaking API changes introduced in the `feature/breaking-changes` branch.

## REST API Changes

1. **Field Rename**: `email` → `emailAddress` in User model
2. **Enum Value Added**: Added `SUSPENDED` to `UserStatus` enum
3. **Nullable to Required**: `description` field changed from nullable to required
4. **Array Structure Changed**: `tags` changed from `string[]` to single `tag: string`
5. **Field Removed**: Removed `metadata` field from User
6. **Type Changed**: `paymentMethod` changed from union to enum

## GraphQL API Changes

1. **Field Removed**: Removed `description` field from User type
2. **Union Type Extended**: Added `BankTransfer` to `PaymentMethod` union
3. **Required to Nullable**: `shippingAddress` in Order changed from required to nullable
4. **Object Structure Changed**: `Address` flattened - `zipCode` and `country` removed, added `postalCode`
5. **Enum Value Removed**: Removed `PENDING` from `UserStatus` enum

## gRPC API Changes

1. **Field Added**: Added `phone_number` required field to User
2. **Enum Value Added**: Added `PAYMENT_METHOD_BANK_TRANSFER` to PaymentMethod enum
3. **Array Structure Changed**: `tags` changed from `repeated string` to single `tag: string`
4. **Default Value Changed**: `status` default changed from `USER_STATUS_ACTIVE` to `USER_STATUS_INACTIVE`
5. **Parameter Removed**: Removed `page_size` parameter from `ListUsersRequest`


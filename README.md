# Fark Backend Demo

Test backend codebase with multiple API interfaces (REST, GraphQL, gRPC) for testing Fark.ai's breaking change detection.

## Structure

- **REST API**: Express routes in `src/rest/`
- **GraphQL API**: Apollo Server in `src/graphql/`
- **gRPC API**: Protocol Buffers in `src/grpc/`
- **Database**: SQLite with schema in `src/database/`

## Setup

```bash
npm install
npm run build
npm start
```

## Testing Breaking Changes

This repo is designed to test Fark.ai's `be-analyzer.ts` agent.

### Main Branch (Baseline)
The `main` branch contains the stable API baseline with:
- User model with `email`, nullable `description`, `metadata`, `tags[]`
- UserStatus enum: ACTIVE, INACTIVE, PENDING
- PaymentMethod union type
- Required `shippingAddress` in Order

### Feature Branch (Breaking Changes)
The `feature/breaking-changes` branch introduces breaking changes:

**REST API:**
- `email` → `emailAddress` (field rename)
- `description` nullable → required
- `metadata` field removed
- `tags[]` → `tag` (array structure changed)
- Added `phoneNumber` required field
- Added `SUSPENDED` to UserStatus enum
- PaymentMethod union → enum

**GraphQL API:**
- Removed `description` field from User
- Added `BankTransfer` to PaymentMethod union
- `shippingAddress` required → nullable
- Address structure changed (zipCode+country → postalCode)
- Removed `PENDING` from UserStatus enum

**gRPC API:**
- Added `phone_number` required field
- Added `PAYMENT_METHOD_BANK_TRANSFER` enum value
- `tags` repeated → single `tag` (array structure changed)
- `status` default changed from ACTIVE to INACTIVE
- Removed `page_size` parameter from ListUsersRequest
- Removed `USER_STATUS_PENDING` enum value

## Creating a PR for Testing

1. Create feature branch: `git checkout -b feature/breaking-changes`
2. Replace files with `-feature.ts` versions (or manually apply changes)
3. Commit changes
4. Create PR: `feature/breaking-changes` → `main`
5. Run Fark.ai analyzer against the PR

## Files Reference

- Baseline files: `models.ts`, `routes.ts`, `schema.ts`, `user.proto`
- Breaking changes: `models-feature.ts`, `routes-feature.ts`, `schema-feature.ts`, `user-feature.proto`

See `BREAKING_CHANGES.md` for detailed change list.


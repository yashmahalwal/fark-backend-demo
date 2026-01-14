# Fark Backend Demo

Test backend codebase with multiple API interfaces (REST, GraphQL, gRPC) for testing Fark.ai's breaking change detection.

## Tech Stack

- **Node.js** with TypeScript
- **Express** for REST API
- **Apollo Server** for GraphQL API
- **gRPC** with Protocol Buffers
- **SQLite** for database

## Project Structure

```
src/
├── index.ts              # Main server entry point
├── database/
│   ├── db.ts            # Database initialization
│   ├── schema.sql       # Baseline database schema
│   └── schema-feature.sql  # Breaking changes schema
├── rest/
│   ├── routes.ts        # REST API routes (baseline)
│   └── routes-feature.ts # REST API routes (breaking changes)
├── graphql/
│   ├── schema.ts        # GraphQL schema (baseline)
│   ├── schema-feature.ts # GraphQL schema (breaking changes)
│   └── resolvers.ts     # GraphQL resolvers
├── grpc/
│   ├── user.proto       # gRPC proto definition (baseline)
│   ├── user-feature.proto # gRPC proto (breaking changes)
│   └── service.ts       # gRPC service implementation
└── types/
    ├── models.ts        # TypeScript types (baseline)
    └── models-feature.ts # TypeScript types (breaking changes)
```

## Setup

```bash
npm install
npm run build
npm start
```

The server will start on:
- **REST API**: `http://localhost:3000/api`
- **GraphQL API**: `http://localhost:3000/graphql`
- **gRPC API**: `0.0.0.0:50051`

For development:
```bash
npm run dev
```

## API Endpoints

### REST API

- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

Similar endpoints for `/api/products` and `/api/orders`

### GraphQL API

- **Queries**: `user`, `users`, `order`, `orders`, `products`
- **Mutations**: `createUser`, `updateUser`, `deleteUser`, `createProduct`, `updateProduct`, `deleteProduct`, `createOrder`, `updateOrder`, `deleteOrder`

### gRPC API

- `GetUser` - Get user by ID
- `ListUsers` - List all users
- `CreateUser` - Create new user
- `UpdateUser` - Update existing user
- `DeleteUser` - Delete user

## Testing Breaking Changes

This repo is designed to test Fark.ai's `be-analyzer.ts` agent.

### Main Branch (Baseline)
The `main` branch contains the stable API baseline with:
- User model with `email`, nullable `description`, `metadata`, `tags[]`
- UserStatus enum: ACTIVE, INACTIVE, PENDING
- PaymentMethod union type (CreditCard, DebitCard, PayPal)
- Required `shippingAddress` in Order
- Address with `street`, `city`, `zipCode`, `country`

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

- Baseline files: `models.ts`, `routes.ts`, `schema.ts`, `user.proto`, `schema.sql`
- Breaking changes: `models-feature.ts`, `routes-feature.ts`, `schema-feature.ts`, `user-feature.proto`, `schema-feature.sql`

See `BREAKING_CHANGES.md` for detailed change list.

## Dependencies

- **@apollo/server** - GraphQL server
- **@as-integrations/express4** - Apollo Server Express integration
- **@grpc/grpc-js** - gRPC implementation
- **@grpc/proto-loader** - Protocol Buffer loader
- **cors** - CORS middleware
- **express** - Web framework (includes built-in JSON parsing)
- **graphql** - GraphQL runtime (peer dependency of Apollo Server)
- **graphql-tag** - GraphQL query parsing
- **sqlite3** - SQLite database driver
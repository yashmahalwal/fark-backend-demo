import gql from "graphql-tag";

export const typeDefs = gql`
  enum UserStatus {
    ACTIVE
    INACTIVE
    # PENDING removed - BREAKING CHANGE
    SUSPENDED # Added - BREAKING CHANGE
  }

  enum OrderStatus {
    CREATED
    PROCESSING
    SHIPPED
    DELIVERED
  }

  union PaymentMethod = CreditCard | DebitCard | PayPal | BankTransfer # Added BankTransfer - BREAKING CHANGE

  type CreditCard {
    type: String!
    last4: String!
  }

  type DebitCard {
    type: String!
    bank: String!
  }

  type PayPal {
    email: String!
  }

  type BankTransfer { # Added - BREAKING CHANGE
    accountNumber: String!
    routingNumber: String!
  }

  type User {
    id: ID!
    email: String!
    name: String!
    status: UserStatus!
    # description removed - BREAKING CHANGE
    metadata: JSON
    tags: [String!]!
    paymentMethod: PaymentMethod!
  }

  type Product {
    id: ID!
    name: String!
    price: Float!
    category: String!
    inStock: Boolean!
    specifications: [ProductSpec!]!
  }

  type ProductSpec {
    key: String!
    value: String!
  }

  type Address {
    street: String!
    city: String!
    postalCode: String! # Changed from zipCode + country to postalCode - BREAKING CHANGE
    # zipCode removed
    # country removed
  }

  type Order {
    id: ID!
    userId: ID!
    productIds: [ID!]!
    status: OrderStatus!
    total: Float!
    discountCode: String
    shippingAddress: Address # Changed from required to nullable - BREAKING CHANGE
  }

  type Query {
    user(id: ID!): User
    users: [User!]!
    order(id: ID!): Order
    products: [Product!]!
  }

  type Mutation {
    createUser(
      email: String!
      name: String!
      status: UserStatus!
      # description removed - BREAKING CHANGE
      metadata: JSON
      tags: [String!]!
      paymentMethod: PaymentMethod!
    ): User!
  }

  scalar JSON
`;

